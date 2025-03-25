import RNFS from 'react-native-fs';
// @ts-ignore
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { PlayPattern } from '@/constants/rules';
import { format } from 'date-fns';
import RNVideoInfo from 'react-native-video-info';
// import { createThumbnail } from 'react-native-create-thumbnail';
import { toByteArray, fromByteArray } from 'base64-js';

// 创建文件
export const createFile = async (path: string, content: any) => {
  try {
    await RNFS.writeFile(path, content, 'utf8');
    return true;
  } catch (err) {
    console.error('Error creating file:', err);
    return false;
  }
};

// 读取文件
export const readFile = async (path: string) => {
  try {
    const content = await RNFS.readFile(path, 'utf8');
    return content;
  } catch (err) {
    console.error('Error reading file:', err);
    return null;
  }
};

// 更新文件
export const updateFile = async (path: string, content: any) => {
  try {
    await RNFS.writeFile(path, content, 'utf8');
    return true;
  } catch (err) {
    console.error('Error updating file:', err);
    return false;
  }
};

// 删除文件
export const deleteFile = async (path: string) => {
  try {
    await RNFS.unlink(path);
    return true;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
};

/**
 * 删除文件夹（递归删除）
 * @param {string} folderPath - 要删除的文件夹路径
 */
export const deleteFolder = async (folderPath: string) => {
  try {
    // 检查路径是否存在
    const stats = await RNFS.stat(folderPath);
    if (stats.isDirectory()) {
      // 如果是目录，递归删除目录内的所有内容
      const items = await RNFS.readDir(folderPath);
      for (const item of items) {
        const itemPath = `${folderPath}/${item.name}`;
        const itemStats = await RNFS.stat(itemPath);
        if (itemStats.isDirectory()) {
          // 如果是子目录，递归调用删除函数
          await deleteFolder(itemPath);
        } else {
          // 如果是文件，直接删除
          await RNFS.unlink(itemPath);
        }
      }
    }
    // 删除当前目录
    await RNFS.unlink(folderPath);
    console.log(`Folder deleted successfully: ${folderPath}`);
  } catch (error) {
    console.error(`Error deleting folder: ${folderPath}`, error);
    throw error; // 可以选择抛出错误，让调用者处理
  }
};

// 读取目录下所有视频文件
export const readVideoFiles = async (directoryPath: string) => {
  if (!directoryPath) {
    return []; // 返回空数组而不是 false
  }
  try {
    // 获取目录中的所有文件和子目录
    const files = await RNFS.readDir(directoryPath);
    const videoFiles: {
      fileName: string;
      size: number; // 以 MB 为单位
      length: string; // 时长（分钟:秒 或 小时:分钟:秒）
      downTime: string; // 下载时间
      cover: string; // 缩略图路径
      path: string;
      id: string;
      updateAt: string;
    }[] = [];

    // 遍历文件和子目录
    for (const file of files) {
      // 如果是目录，递归读取其中的视频文件
      if (file.isDirectory()) {
        const subDirectoryVideoFiles = await readVideoFiles(file.path);
        videoFiles.push(...subDirectoryVideoFiles); // 现在可以安全地展开数组
      } else {
        // 使用正则表达式检查是否为视频文件
        if (PlayPattern.test(file.path)) {
          // 获取视频文件的基本信息
          const videoInfo = await getVideoInfo(file.path);
          if (videoInfo) {
            videoFiles.push(videoInfo as any);
          }
        }
      }
    }

    // 按下载时间排序，新的在前
    videoFiles.sort(
      (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime(),
    );

    return videoFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return []; // 返回空数组而不是 false
  }
};

// 获取视频文件的详细信息
const getVideoInfo = async (filePath: string) => {
  try {
    // 获取文件大小（以 MB 为单位），保留一位小数
    const fileSizeInBytes = await RNFS.stat(filePath).then(stat => stat.size);
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(1);

    // 获取视频时长（秒），并转换为合适的格式
    const videoInfo = await RNVideoInfo.get(filePath);
    const durationInSeconds = videoInfo.duration;
    let duration: string;

    if (durationInSeconds >= 3600) {
      // 如果时长大于等于 1 小时，显示为小时:分钟:秒格式
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      duration = `${hours.toString().padStart(1, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // 否则显示为分钟:秒格式
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      duration = `${minutes.toString().padStart(1, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }

    const fileName = filePath.split('/').pop() || '';
    const [updateAt, downTime] = await getFileModificationTime(filePath);

    // 生成缩略图（可选）
    // const thumbnailPath = await createThumbnail({
    //   url: filePath,
    //   timeStamp: 10000,
    // });
    const thumbnailPath = ''; // 如果不需要缩略图，可以保持为空

    return {
      fileName,
      size: parseFloat(fileSizeInMB), // 转换回数字类型
      length: duration,
      downTime,
      cover: thumbnailPath,
      path: filePath,
      id: fileName,
      updateAt,
    };
  } catch (err) {
    console.error('Error getting video info:', err);
    return null;
  }
};

// 获取文件的最后修改时间并格式化为 yyyy-MM-dd HH:mm:ss
const getFileModificationTime = async (filePath: string) => {
  try {
    const stats = await RNFS.stat(filePath);
    if (stats) {
      const modificationTime = stats.mtime; // 文件的最后修改时间
      const formattedTime = format(
        new Date(modificationTime),
        'yyyy-MM-dd HH:mm:ss',
      );
      console.log('文件最后修改时间:', formattedTime);
      return [modificationTime, formattedTime];
    } else {
      console.error('文件不存在');
      return [null, null];
    }
  } catch (error) {
    console.error('获取文件修改时间失败:', error);
    return [null, null];
  }
};

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
  try {
    // 检查服务器是否支持分块下载
    const response = await fetch(url, { method: 'HEAD' });
    const acceptRanges = response.headers.get('accept-ranges');
    const contentLength = parseInt(
      response.headers.get('content-length') || '0',
      10,
    );

    if (!contentLength) {
      console.error('无法获取文件大小');
      return { success: false, error: '无法获取文件大小' };
    }

    let chunks: { start: number; end: number }[] = [];
    if (acceptRanges === 'bytes') {
      // 服务器支持分块下载
      const chunkSize = Math.ceil(contentLength / numberOfThreads);
      for (let i = 0; i < numberOfThreads; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, contentLength - 1);
        chunks.push({ start, end });
      }
    } else {
      // 服务器不支持分块下载，回退到单线程下载
      console.warn(
        'Server does not support byte ranges, falling back to single-thread download',
      );
      chunks = [{ start: 0, end: contentLength - 1 }];
      numberOfThreads = 1;
    }

    // 并行下载每个块
    const downloadPromises = chunks.map(async (chunk, index) => {
      const tempFilePath = `${directoryPath}/${fileName}.${index}.tmp`;
      console.log('Temp file path:', tempFilePath); // 调试日志

      const downloadTask = RNFS.downloadFile({
        fromUrl: url,
        toFile: tempFilePath,
        headers: {
          Range: `bytes=${chunk.start}-${chunk.end}`,
        },
        begin: res => {
          console.log(`Thread ${index} started`, res);
          if (res.statusCode !== 206 && numberOfThreads > 1) {
            console.error(`Thread ${index} failed to start`, res);
            throw new Error(`Thread ${index} failed to start`);
          }
        },
        progress: res => {
          const percentage = (
            (res.bytesWritten / (chunk.end - chunk.start + 1)) *
            100
          ).toFixed(1);
          const loadedMb = (res.bytesWritten / 1024 / 1024).toFixed(1);
          const totalMb = (contentLength / 1024 / 1024).toFixed(1);
          const speed = (
            res.bytesWritten /
            1024 /
            1024 /
            (Date.now() / 1000)
          ).toFixed(1);
          console.log(`Thread ${index} progress`);
          onProgress(url, percentage, loadedMb, totalMb, speed); // 传递所有5个参数
        },
      });

      try {
        await downloadTask.promise;
      } catch (err: any) {
        console.log('err', err);
      }

      const result = await downloadTask.promise;
      if (result.statusCode !== 206 && numberOfThreads > 1) {
        throw new Error(`Thread ${index} failed`);
      }

      // 检查文件是否真的被创建
      if (!(await RNFS.exists(tempFilePath))) {
        throw new Error(`Thread ${index} failed to create file`);
      }

      // 检查文件大小是否正确
      const fileStats = await RNFS.stat(tempFilePath);
      if (fileStats.size !== chunk.end - chunk.start + 1) {
        throw new Error(`Thread ${index} file size mismatch`);
      }

      return { filePath: tempFilePath, start: chunk.start };
    });

    console.log('wait download start');
    // 等待所有块下载完成
    const chunkResults = await Promise.all(downloadPromises);
    console.log('wait download end');

    console.log('merge file start');
    // 合并文件
    const filePath = `${directoryPath}/${fileName}`;
    for (const chunkResult of chunkResults) {
      // 检查块文件是否存在
      if (!(await RNFS.exists(chunkResult.filePath))) {
        throw new Error(`Chunk file ${chunkResult.filePath} not found`);
      }

      const data = await RNFS.readFile(chunkResult.filePath, 'base64');
      await RNFS.appendFile(filePath, data, 'base64');
    }
    console.log('merge file end');

    const endTime = new Date().toISOString();
    return { success: true, endTime };
  } catch (err: any) {
    console.error('Error downloading video:', err);
    return { success: false, error: err.message || 'Unknown error' };
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
    const m3u8FilePath = `${directoryPath}/temp.m3u8`;
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
    const tsDirectoryPath = `${directoryPath}/ts_files`;
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
    await RNFS.unlink(m3u8FilePath);
    await deleteFolder(tsDirectoryPath);

    const endTime = new Date().toISOString();
    return { success: true, endTime };
  } catch (err) {
    console.error('Error downloading M3U8 video:', err);
    return { success: false, error: err };
  }
};

// 替代 RNFS.getFileSize 的方法
const getFileSizeByUrl = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    return 0;
  } catch (err) {
    console.error('Failed to get file size:', err);
    return 0;
  }
};

async function mergeTsFiles(tsFilePaths: any, outputFilePath: string) {
  // 存放解码后的 Uint8Array 数组
  const arrays = [];

  for (const tsFilePath of tsFilePaths) {
    // 读取 Base64 格式内容
    const base64Data = await RNFS.readFile(tsFilePath, 'base64');
    // 解码为 Uint8Array
    const byteArray = toByteArray(base64Data);
    arrays.push(byteArray);
  }

  // 计算拼接后总长度
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Uint8Array(totalLength);

  // 合并所有 Uint8Array
  let offset = 0;
  for (const arr of arrays) {
    combined.set(arr, offset);
    offset += arr.length;
  }

  // 将合并后的二进制数据重新编码为 Base64
  const finalBase64 = fromByteArray(combined);

  try {
    // 写入文件
    await RNFS.writeFile(outputFilePath, finalBase64, 'base64');
    console.log('合并写入成功', outputFilePath);
  } catch (err) {
    console.error(err);
  }
}
