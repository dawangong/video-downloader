import RNFS from 'react-native-fs';
// @ts-ignore
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import {
  getFileSizeByUrl,
  mergeTsFiles,
  deleteFolder,
  deleteFile,
} from './tools';

export type OnProgressCallback = (
  url: string,
  percentage: string,
  loadedMb: string,
  totalMb: string,
  speed: string,
) => void;

// 下载普通视频文件(多线程)
export const downloadNormalVideo2 = async (
  url: string,
  fileName: string,
  directoryPath: string,
  onProgress: OnProgressCallback,
  numberOfThreads: number = 10, // 默认使用10个线程
) => {
  const MAX_RETRIES = 3; // 每个分块下载最大重试次数
  try {
    // 检查目标目录是否存在，不存在则创建
    if (!(await RNFS.exists(directoryPath))) {
      await RNFS.mkdir(directoryPath);
    }

    // 使用 HEAD 请求获取文件信息
    const headResponse = await fetch(url, { method: 'HEAD' });
    const acceptRanges = headResponse.headers.get('accept-ranges');
    const contentLength = parseInt(
      headResponse.headers.get('content-length') || '0',
      10,
    );

    if (!contentLength) {
      console.error('无法获取文件大小');
      return { success: false, error: '无法获取文件大小' };
    }

    // 创建临时文件夹保存分块数据
    const tempFolder = `${directoryPath}/${fileName.replace('.mp4', '')}_tmp`;
    if (!(await RNFS.exists(tempFolder))) {
      await RNFS.mkdir(tempFolder);
    }

    // 根据是否支持分块下载决定分块方案
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

    // 定义下载单个分块的方法，增加重试机制
    const downloadChunk = async (
      chunk: { start: number; end: number },
      index: number,
    ): Promise<{ filePath: string; start: number }> => {
      const tempFilePath = `${tempFolder}/${index}.tmp.mp4`;
      let attempt = 0;
      while (attempt < MAX_RETRIES) {
        try {
          const downloadTask = RNFS.downloadFile({
            fromUrl: url,
            toFile: tempFilePath,
            headers: {
              Range: `bytes=${chunk.start}-${chunk.end}`,
            },
            begin: res => {
              if (res.statusCode !== 206 && numberOfThreads > 1) {
                throw new Error(
                  `Thread ${index} 开始下载失败，状态码：${res.statusCode}`,
                );
              }
              console.log(`线程 ${index} 开始下载：`, res);
            },
            progress: res => {
              const totalBytes = chunk.end - chunk.start + 1;
              const percentage = (
                (res.bytesWritten / totalBytes) *
                100
              ).toFixed(1);
              const loadedMb = (res.bytesWritten / 1024 / 1024).toFixed(1);
              const totalMb = (totalBytes / 1024 / 1024).toFixed(1);
              // 可根据任务开始时间调整速度计算
              const speed = (
                res.bytesWritten /
                1024 /
                1024 /
                (Date.now() / 1000)
              ).toFixed(1);
              onProgress(url, percentage, loadedMb, totalMb, speed);
            },
          });

          const result = await downloadTask.promise;
          if (result.statusCode !== 206 && numberOfThreads > 1) {
            throw new Error(
              `线程 ${index} 下载失败，状态码：${result.statusCode}`,
            );
          }

          // 检查文件是否存在且大小正确
          if (!(await RNFS.exists(tempFilePath))) {
            throw new Error(`线程 ${index} 未能创建文件`);
          }
          const fileStats = await RNFS.stat(tempFilePath);
          if (fileStats.size !== chunk.end - chunk.start + 1) {
            throw new Error(`线程 ${index} 文件大小不匹配`);
          }

          console.log(`线程 ${index} 下载成功`);
          return { filePath: tempFilePath, start: chunk.start };
        } catch (err) {
          attempt++;
          console.warn(`线程 ${index} 第 ${attempt} 次尝试失败：`, err);
          if (attempt >= MAX_RETRIES) {
            throw new Error(
              `线程 ${index} 超过最大重试次数，失败原因：${err.message || err}`,
            );
          }
          // 可加入短暂延时后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      // 若重试后依旧失败，则抛出错误
      throw new Error(`线程 ${index} 下载失败`);
    };

    // 并行下载所有分块
    const downloadPromises = chunks.map((chunk, index) =>
      downloadChunk(chunk, index),
    );
    console.log('开始并行下载所有分块');
    const chunkResults = await Promise.all(downloadPromises);
    console.log('所有分块下载完成');

    // 合并所有分块文件
    const finalFilePath = `${directoryPath}/${fileName}`;
    if (await RNFS.exists(finalFilePath)) {
      await RNFS.unlink(finalFilePath);
    }
    for (const chunkResult of chunkResults.sort((a, b) => a.start - b.start)) {
      if (!(await RNFS.exists(chunkResult.filePath))) {
        throw new Error(`分块文件 ${chunkResult.filePath} 不存在`);
      }
      const data = await RNFS.readFile(chunkResult.filePath, 'base64');
      await RNFS.appendFile(finalFilePath, data, 'base64');
    }
    console.log('文件合并完成');

    // 删除临时文件夹及其内容
    if (await RNFS.exists(tempFolder)) {
      await RNFS.unlink(tempFolder);
      console.log('临时文件夹已删除');
    }

    const endTime = new Date().toISOString();
    return { success: true, endTime };
  } catch (err: any) {
    console.error('下载视频时发生错误:', err);
    return { success: false, error: err.message || '未知错误' };
  }
};

// 下载普通视频文件(单线程)
export const downloadNormalVideo = async (
  url: string,
  fileName: string,
  directoryPath: string,
  onProgress: OnProgressCallback,
) => {
  try {
    let lastTime = 0; // 上一次时间戳
    let lastLoaded = 0; // 上一次已下载的字节数

    const filePath = `${directoryPath}/${fileName}`;
    // 检查目录是否存在
    const directoryExists = await RNFS.exists(directoryPath);
    if (!directoryExists) {
      await RNFS.mkdir(directoryPath); // 创建目录
    }

    const downloadTask = RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      begin: res => {
        console.log('Started', res);
        lastTime = new Date().getTime(); // 初始化时间戳
        lastLoaded = 0; // 初始化已下载字节数
      },
      progress: res => {
        const percentage = (
          (res.bytesWritten / res.contentLength) *
          100
        ).toFixed(1);
        const loadedMb = (res.bytesWritten / 1024 / 1024).toFixed(1);
        const totalMb = (res.contentLength / 1024 / 1024).toFixed(1);

        // 计算下载速度
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTime; // 时间差（毫秒）
        const loadedDiff = res.bytesWritten - lastLoaded; // 数据量差（字节）

        let speed = 0;
        if (timeDiff > 0 && loadedDiff > 0) {
          speed = loadedDiff / 1024 / 1024 / (timeDiff / 1000); // MB/s
        }

        // 更新上次的时间和已下载字节数
        lastTime = currentTime;
        lastLoaded = res.bytesWritten;

        onProgress(url, percentage, loadedMb, totalMb, speed.toFixed(1)); // 传递下载速度
      },
    });

    const downloadResult = await downloadTask.promise;
    if (downloadResult.statusCode === 200) {
      const endTime = new Date().toISOString();
      return { success: true, endTime };
    } else {
      return { success: false, error: 'Download failed' };
    }
  } catch (err) {
    console.error('Error downloading video:', err);
    return { success: false, error: err };
  }
};

export const downloadM3U8Video = async (
  url: string,
  fileName: string,
  directoryPath: string,
  onProgress: OnProgressCallback,
) => {
  try {
    let lastTime = 0; // 上一次时间戳
    let lastLoaded = 0; // 上一次已下载的字节数
    let totalSize = 0; // 总大小（字节）
    let downloadedSize = 0; // 已下载大小（字节）

    const outputPath = `${directoryPath}/${fileName.replace('.m3u8', '.mp4')}`;
    // 检查目录是否存在
    const directoryExists = await RNFS.exists(directoryPath);
    if (!directoryExists) {
      await RNFS.mkdir(directoryPath); // 创建目录
    }

    // 下载 m3u8 文件
    const m3u8FilePath = `${directoryPath}/${fileName}_temp.m3u8`;
    const m3u8DownloadTask = RNFS.downloadFile({
      fromUrl: url,
      toFile: m3u8FilePath,
      begin: res => {
        console.log('Started downloading m3u8 file', res);
        lastTime = new Date().getTime(); // 初始化时间戳
        lastLoaded = 0; // 初始化已下载字节数
      },
    });

    const m3u8DownloadResult = await m3u8DownloadTask.promise;
    if (m3u8DownloadResult.statusCode !== 200) {
      return { success: false, error: 'Failed to download m3u8 file' };
    }

    // 解析 m3u8 文件，获取 TS 文件的链接
    const m3u8Content = await RNFS.readFile(m3u8FilePath, 'utf8');
    const tsFileUrls = [];
    const lines = m3u8Content.split('\n');
    for (const line of lines) {
      if (!line.startsWith('#') && line.trim() !== '') {
        tsFileUrls.push(line.trim());
      }
    }

    // 创建一个临时目录来存储 TS 文件
    const tsDirectoryPath = `${directoryPath}/${fileName}_ts`;
    const tsDirectoryExists = await RNFS.exists(tsDirectoryPath);
    if (!tsDirectoryExists) {
      await RNFS.mkdir(tsDirectoryPath);
    }

    // 获取所有 TS 文件的大小并计算总大小
    for (const tsUrl of tsFileUrls) {
      const tsFileSize = await getFileSizeByUrl(tsUrl);
      totalSize += tsFileSize;
    }

    // 下载所有的 TS 文件
    const tsDownloadPromises = [];
    for (let i = 0; i < tsFileUrls.length; i++) {
      const tsUrl = tsFileUrls[i];
      const tsFilePath = `${tsDirectoryPath}/${i}.ts`;
      tsDownloadPromises.push(
        new Promise<void>(async resolve => {
          try {
            const tsDownloadTask = RNFS.downloadFile({
              fromUrl: tsUrl,
              toFile: tsFilePath,
            });

            // 使用 stats 方法来监听页面下载进度
            const intervalId = setInterval(async () => {
              try {
                const stats = await RNFS.stat(tsFilePath);
                if (stats.isFile()) {
                  downloadedSize = stats.size;
                  const percentage =
                    totalSize > 0
                      ? ((downloadedSize / totalSize) * 100).toFixed(1)
                      : '0.0';
                  const loadedMb = (downloadedSize / 1024 / 1024).toFixed(1);
                  const totalMb = (totalSize / 1024 / 1024).toFixed(1);

                  // 计算下载速度
                  const currentTime = new Date().getTime();
                  const timeDiff = currentTime - lastTime; // 时间差（毫秒）
                  const loadedDiff = downloadedSize - lastLoaded; // 数据量差（字节）

                  let speed = 0;
                  if (timeDiff > 0 && loadedDiff > 0) {
                    speed = loadedDiff / 1024 / 1024 / (timeDiff / 1000); // MB/s
                  }

                  // 更新上次的时间和已下载字节数
                  lastTime = currentTime;
                  lastLoaded = downloadedSize;

                  onProgress(
                    url,
                    percentage,
                    loadedMb,
                    totalMb,
                    speed.toFixed(1),
                  ); // 传递下载速度
                }
              } catch (err) {
                // 文件可能还未创建
              }
            }, 1000);

            tsDownloadTask.promise.then(async result => {
              clearInterval(intervalId);
              if (result.statusCode === 200) {
                const fileStat = await RNFS.stat(tsFilePath);
                downloadedSize = fileStat.size;
                const percentage =
                  totalSize > 0
                    ? ((downloadedSize / totalSize) * 100).toFixed(1)
                    : '0.0';
                const loadedMb = (downloadedSize / 1024 / 1024).toFixed(1);
                const totalMb = (totalSize / 1024 / 1024).toFixed(1);

                // 计算下载速度
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastTime; // 时间差（毫秒）
                const loadedDiff = downloadedSize - lastLoaded; // 数据量差（字节）

                let speed = 0;
                if (timeDiff > 0 && loadedDiff > 0) {
                  speed = loadedDiff / 1024 / 1024 / (timeDiff / 1000); // MB/s
                }

                // 更新上次的时间和已下载字节数
                lastTime = currentTime;
                lastLoaded = downloadedSize;

                onProgress(
                  url,
                  percentage,
                  loadedMb,
                  totalMb,
                  speed.toFixed(1),
                ); // 传递下载速度

                resolve();
              } else {
                resolve();
              }
            });
          } catch (err) {
            resolve();
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
    mergeTsFiles(_tsFilePaths, outputPath);

    // 清理临时文件
    await deleteFile(m3u8FilePath);
    await deleteFolder(tsDirectoryPath);

    const endTime = new Date().toISOString();
    return { success: true, endTime };
  } catch (err) {
    console.error('Error downloading M3U8 video:', err);
    return { success: false, error: err };
  }
};
