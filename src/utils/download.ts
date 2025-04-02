import RNFS from 'react-native-fs';
import {
  getFileNameAndExtension,
  mergeTsFilesStream,
  getVideoSize,
  deleteFolder,
  deleteFile,
  throttle,
} from './tools';
import downloadManager from './DownloadManage';

export type OnProgressCallback = (
  url: string,
  percentage: string,
  loadedMb: string,
  totalMb: string,
  speed: string,
  status: 'downloading' | 'error',
) => void;

// 下载普通视频文件(多线程)
export const downloadNormalVideo = async (
  url: string,
  fileName: string,
  directoryPath: string,
  onProgress: OnProgressCallback,
  numberOfThreads: number = 10, // 默认使用10个线程
) => {
  const MAX_RETRIES = 10; // 每个分块下载最大重试次数

  try {
    const { extension } = getFileNameAndExtension(url);

    // 检查目标目录是否存在
    if (!(await RNFS.exists(directoryPath))) {
      await RNFS.mkdir(directoryPath);
    }

    // 获取文件大小信息
    const headResponse = await fetch(url, { method: 'HEAD' });
    const acceptRanges = headResponse.headers.get('accept-ranges');
    const contentLength = parseInt(
      headResponse.headers.get('content-length') || '0',
      10,
    );

    if (!contentLength) {
      console.error('无法获取文件大小');
      onProgress(url, '0.0', '0.0', '0.0', '0.0', 'error'); // Report error
      return { success: false, error: '无法获取文件大小' };
    }

    // 创建临时文件夹
    const tempFolder = `${directoryPath}/${fileName.replace(
      `.${extension}`,
      '',
    )}_tmp`;
    if (!(await RNFS.exists(tempFolder))) {
      await RNFS.mkdir(tempFolder);
    }

    // 初始化下载状态
    downloadManager.startDownload(url, numberOfThreads);

    let totalDownloaded = 0;
    const progressMap = new Array(numberOfThreads).fill(0);
    const startTime = Date.now();

    // 限制 onProgress 触发频率（500ms 一次）
    const throttledOnProgress = throttle(onProgress, 500);

    let chunks: { start: number; end: number }[] = [];
    if (acceptRanges === 'bytes') {
      const chunkSize = Math.ceil(contentLength / numberOfThreads);
      for (let i = 0; i < numberOfThreads; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, contentLength - 1);
        chunks.push({ start, end });
      }
    } else {
      console.warn('服务器不支持分块下载，使用单线程下载');
      chunks = [{ start: 0, end: contentLength - 1 }];
      numberOfThreads = 1;
    }

    const downloadChunk = async (
      chunk: { start: number; end: number },
      index: number,
    ) => {
      const tempFilePath = `${tempFolder}/${index}.tmp.${extension}`;
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          const downloadTask = RNFS.downloadFile({
            fromUrl: url,
            toFile: tempFilePath,
            headers: { Range: `bytes=${chunk.start}-${chunk.end}` },
            begin: res => {
              if (res.statusCode !== 206 && numberOfThreads > 1) {
                throw new Error(
                  `线程 ${index} 开始下载失败，状态码：${res.statusCode}`,
                );
              }
            },
            progress: res => {
              const prevProgress = progressMap[index];
              progressMap[index] = res.bytesWritten;
              totalDownloaded += progressMap[index] - prevProgress;

              const percentage = (
                (totalDownloaded / contentLength) *
                100
              ).toFixed(1);
              const loadedMb = (totalDownloaded / 1024 / 1024).toFixed(1);
              const totalMb = (contentLength / 1024 / 1024).toFixed(1);
              const elapsedTime = (Date.now() - startTime) / 1000;
              const downloadSpeed = (
                totalDownloaded /
                1024 /
                1024 /
                elapsedTime
              ).toFixed(2);

              throttledOnProgress(
                url,
                percentage,
                loadedMb,
                totalMb,
                downloadSpeed,
                'downloading', // Pass 'downloading' status
              );
            },
          });

          const result = await downloadTask.promise;
          if (result.statusCode !== 206 && numberOfThreads > 1) {
            throw new Error(
              `线程 ${index} 下载失败，状态码：${result.statusCode}`,
            );
          }

          if (!(await RNFS.exists(tempFilePath))) {
            throw new Error(`线程 ${index} 未能创建文件`);
          }

          const fileStats = await RNFS.stat(tempFilePath);
          if (fileStats.size !== chunk.end - chunk.start + 1) {
            throw new Error(`线程 ${index} 文件大小不匹配`);
          }

          downloadManager.updateDownloadStatus(url, index);
          return { filePath: tempFilePath, start: chunk.start };
        } catch (err) {
          attempt++;
          console.warn(`线程 ${index} 第 ${attempt} 次尝试失败：`, err);
          if (attempt >= MAX_RETRIES) {
            onProgress(url, '0.0', '0.0', '0.0', '0.0', 'error'); // Report error after max retries
            throw new Error(`线程 ${index} 超过最大重试次数`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      throw new Error(`线程 ${index} 下载失败`);
    };

    const chunkResults = await Promise.all(
      chunks.map((chunk, index) => downloadChunk(chunk, index)),
    );

    const finalFilePath = `${directoryPath}/${fileName}`;
    if (await RNFS.exists(finalFilePath)) {
      await deleteFile(finalFilePath);
    }

    for (const chunkResult of chunkResults.sort((a, b) => a.start - b.start)) {
      const data = await RNFS.readFile(chunkResult.filePath, 'base64');
      await RNFS.appendFile(finalFilePath, data, 'base64');
    }

    if (await RNFS.exists(tempFolder)) {
      await deleteFolder(tempFolder);
    }

    return { success: true, endTime: new Date().toISOString() };
  } catch (err: any) {
    console.error('下载视频时发生错误:', err);
    onProgress(url, '0.0', '0.0', '0.0', '0.0', 'error'); // Report error on failure
    return { success: false, error: err.message || '未知错误' };
  }
};

// 分割ts下载m3u8
export const downloadM3U8Video = async (
  url: string,
  fileName: string,
  directoryPath: string,
  m3u8FilePath: string,
  tsFileUrls: Array<string>,
  onProgress: OnProgressCallback,
) => {
  try {
    let totalSize = 0;
    let downloadedSize = 0;
    let downloadedUrls = [];

    const outputPath = `${directoryPath}/${fileName.replace('.m3u8', '.mp4')}`;

    // 创建一个临时目录来存储 TS 文件
    const tsDirectoryPath = `${directoryPath}/${fileName}_ts`;
    const tsDirectoryExists = await RNFS.exists(tsDirectoryPath);
    if (!tsDirectoryExists) {
      await RNFS.mkdir(tsDirectoryPath);
    }

    totalSize = await getVideoSize(tsFileUrls);

    // 下载所有的 TS 文件
    const tsDownloadPromises = [];
    for (let i = 0; i < tsFileUrls.length; i++) {
      const tsUrl = tsFileUrls[i];
      const tsFilePath = `${tsDirectoryPath}/${i}.ts`;
      tsDownloadPromises.push(
        new Promise<void>(async (resolve, reject) => {
          try {
            const tsDownloadTask = RNFS.downloadFile({
              fromUrl: tsUrl,
              toFile: tsFilePath,
            });

            tsDownloadTask.promise.then(async result => {
              if (result.statusCode === 200) {
                const fileStat = await RNFS.stat(tsFilePath);
                downloadedSize += fileStat.size;
                downloadedUrls.push(tsUrl);

                const percentage =
                  tsFileUrls.length > 0
                    ? (
                        (downloadedUrls.length / tsFileUrls.length) *
                        100
                      ).toFixed(1)
                    : '0.0';
                const loadedMb = (downloadedSize / 1024 / 1024).toFixed(1);
                const totalMb = (totalSize / 1024 / 1024).toFixed(1);
                const speed = '后续实现';

                onProgress(
                  url,
                  percentage,
                  loadedMb,
                  totalMb,
                  speed,
                  'downloading', // Pass 'downloading' status
                );

                resolve();
              } else {
                reject(result);
              }
            });
          } catch (err) {
            reject(err);
          }
        }),
      );
    }

    await Promise.all(tsDownloadPromises);

    // 合并所有的 TS 文件为一个 MP4 文件
    const tsFiles = await RNFS.readDir(tsDirectoryPath);
    const tsFilePaths = tsFiles.map(file => file.path);
    const _tsFilePaths = tsFilePaths.sort((a: any, b: any) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });
    await mergeTsFilesStream(_tsFilePaths, outputPath);

    // 清理临时文件
    await deleteFile(m3u8FilePath);
    await deleteFolder(tsDirectoryPath);

    const endTime = new Date().toISOString();
    return { success: true, endTime };
  } catch (err) {
    console.error('Error downloading M3U8 video:', err);
    onProgress(url, '0.0', '0.0', '0.0', '0.0', 'error'); // Report error
    return { success: false, error: err };
  }
};
