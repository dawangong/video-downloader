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
