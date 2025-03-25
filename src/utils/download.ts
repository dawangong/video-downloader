import RNFS from 'react-native-fs';
// import axios from 'axios';
// @ts-ignore
import { FFmpegKit } from 'ffmpeg-kit-react-native';
// import { generateValidPath } from '@/utils/tools';
import { VideoPattern } from '@/constants/rules';
import { format } from 'date-fns';
import RNVideoInfo from 'react-native-video-info';
// import { createThumbnail } from 'react-native-create-thumbnail';

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
        if (VideoPattern.test(file.path)) {
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

// 下载普通视频文件
export const downloadNormalVideo = async (
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

// 下载并转换m3u8视频为mp4
export const downloadM3U8Video = async (
  url: string,
  directoryPath: string,
  fileName: string,
  onProgress: OnProgressCallback,
) => {
  try {
    // 下载m3u8文件
    const m3u8FilePath = `${directoryPath}/${fileName}.m3u8`;
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: m3u8FilePath,
      begin: res => {
        onProgress(0, 0, res.contentLength, 0);
      },
      progress: (event: any) => {
        const percentage = (event.loaded / event.contentLength) * 100;
        const loadedMb = (event.loaded / 1024 / 1024).toFixed(1);
        const totalMb = (event.contentLength / 1024 / 1024).toFixed(1);
        onProgress(percentage, loadedMb, totalMb, 0);
      },
    }).promise;

    // 解析m3u8文件获取ts片段
    const m3u8Content: any = await readFile(m3u8FilePath);
    const tsSegments = m3u8Content
      .split('\n')
      .filter((line: string) => line.startsWith('http'));

    // 下载所有ts片段
    const tsFiles: string[] = [];
    for (let i = 0; i < tsSegments.length; i++) {
      const tsUrl = tsSegments[i];
      const tsFileName = `${fileName}_ts_${i}.ts`;
      const tsFilePath = `${directoryPath}/${tsFileName}`;
      await RNFS.downloadFile({
        fromUrl: tsUrl,
        toFile: tsFilePath,
        begin: res => {
          onProgress(0, 0, res.contentLength, 0);
        },
        progress: (event: any) => {
          const percentage = (event.loaded / event.contentLength) * 100;
          const loadedMb = (event.loaded / 1024 / 1024).toFixed(1);
          const totalMb = (event.contentLength / 1024 / 1024).toFixed(1);
          onProgress(percentage, loadedMb, totalMb, 0);
        },
      }).promise;
      tsFiles.push(tsFilePath);
    }

    // 合并ts片段并转换为mp4
    const mp4FilePath = `${directoryPath}/${fileName}.mp4`;
    const concatCommand = tsFiles.map(path => `-i ${path}`).join(' ');
    const filterComplex =
      tsFiles.map((_, index) => `[${index}:v:0][${index}:a:0]`).join('') +
      'concat=n=' +
      tsFiles.length +
      ':v=1:a=1[outv][outa]';
    const command = ` ${concatCommand} -filter_complex "${filterComplex}" -map "[outv]" -map "[outa]" ${mp4FilePath}`;

    await FFmpegKit.execute(command).then(
      (session: {
        returnCode: () => {
          (): any;
          new (): any;
          getValue: { (): string; new (): any };
        };
      }) => {
        if (session.returnCode().getValue() === '0') {
          // 清理临时文件
          tsFiles.forEach(file => deleteFile(file));
          deleteFile(m3u8FilePath);
          return { success: true };
        } else {
          throw new Error('FFmpeg conversion failed');
        }
      },
    );

    return { success: true };
  } catch (err) {
    console.error('Error downloading and converting m3u8 video:', err);
    return { success: false, error: err };
  }
};
