import { Platform } from 'react-native';
import { pickDirectory } from '@react-native-documents/picker';

import { format } from 'date-fns';
import RNFS from 'react-native-fs';
import RNVideoInfo from 'react-native-video-info';
// import { toByteArray, fromByteArray } from 'base64-js';
// import { createThumbnail } from 'react-native-create-thumbnail';
import RNBlobUtil from 'react-native-blob-util';

import {
  VideoPattern,
  M3U8Pattern,
  PlayPattern,
  VideoNamePattern,
} from '@/constants/rules';

// 验证链接
export const validateLink = (link: string): boolean => VideoPattern.test(link);

// 验证m3u8链接
export const m3u8Link = (link: string): boolean => M3U8Pattern.test(link);

// 截取默认名称
export const sliceVideoName = (link: string): string => {
  const res = link.match(VideoNamePattern)?.[1];
  return res ? res : '';
};

/**
 * 生成带有递增 id 的数组
 * @param {number} length - 数组的长度
 * @param {Object} template - 数据模板对象
 * @returns {Array} - 生成的数组
 */
export const generateArrayWithIncrementalId = (
  length: number,
  template: any,
): any => {
  return new Array(length)
    .fill(null) // 填充 null 以避免引用问题
    .map((_, index) => {
      // 为每个元素创建一个新对象，并添加递增的 id
      return { ...template, id: index + 1 };
    });
};

// 模拟req
export const mockApi = (duration: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, duration * 1000);
  });
};

// 获取默认的下载目录
export const getDefaultDownloadDirectory = async () => {
  try {
    // 根据平台选择不同的目录
    let downloadDir = RNFS.DownloadDirectoryPath; // Android上的下载目录
    if (Platform.OS === 'ios') {
      downloadDir = RNFS.DocumentDirectoryPath; // iOS上的文档目录
    }
    // 确保目录存在
    const isDirExists = await RNFS.exists(downloadDir);
    if (!isDirExists) {
      await RNFS.mkdir(downloadDir);
    }
    return downloadDir;
  } catch (err) {
    console.error('Error getting default download directory:', err);
    return null;
  }
};

// 转换为真实路径
export const convertContentUriToRealPath = (uri: string) => {
  // 解码 URI
  const decodedUri = decodeURIComponent(uri);
  // 提取 "tree/" 后面的部分，即 Document ID
  const treeIndex = decodedUri.indexOf('tree/');
  if (treeIndex === -1) {
    return null;
  }
  // 从 "tree/" 之后开始截取 Document ID
  const documentId = decodedUri.substring(treeIndex + 'tree/'.length);
  // 判断 Document ID 是否以 'primary:' 开头
  if (documentId.startsWith('primary:')) {
    // 替换 'primary:' 为实际的存储路径
    return documentId.replace('primary:', '/storage/emulated/0/');
  }
  return null;
};

// 选择自定义下载目录
export const selectDownloadDirectory = async () => {
  try {
    const { uri } = await pickDirectory({
      requestLongTermAccess: true,
    });
    console.log(uri);
    const path = await convertContentUriToRealPath(uri);
    return path || null;
  } catch (err: any) {
    console.warn(err);
    return null;
  }
};

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
export const deleteFolder = async (folderPath: string, isDelFolder = true) => {
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
          await deleteFile(itemPath);
        }
      }
    }
    // 删除当前目录
    isDelFolder && (await deleteFile(folderPath));
    isDelFolder && console.log(`Folder deleted successfully: ${folderPath}`);
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

    // 遍历当前目录下的文件（不递归子目录）
    for (const file of files) {
      // 使用正则表达式检查是否为视频文件
      if (!file.isDirectory() && PlayPattern.test(file.path)) {
        console.log('file.path', file.path);
        // 获取视频文件的基本信息
        const videoInfo = await getVideoInfo(file.path);
        if (videoInfo) {
          videoFiles.push(videoInfo as any);
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

// 替代 RNFS.getFileSize 的方法
export async function getVideoSize(segmentUrls: Array<string>) {
  // 对每个分片发起 HEAD 请求并获取 Content-Length
  const sizePromises = segmentUrls.map(async url => {
    const headResp = await fetch(url, { method: 'HEAD' });
    const length = headResp.headers.get('Content-Length');
    return length ? parseInt(length, 10) : 0;
  });

  const sizes = await Promise.all(sizePromises);
  const totalSize = sizes.reduce((acc, size) => acc + size, 0);
  console.log('totalSize', totalSize);
  return totalSize; // 单位：字节
}

// 解析 m3u8 文件，获取 TS 文件的链接
export const getM3u8Size = async (url: string, m3u8FilePath: string) => {
  const m3u8Content = await RNFS.readFile(m3u8FilePath, 'utf8');
  const tsFileUrls = [];
  const lines = m3u8Content.split('\n');
  for (const line of lines) {
    if (!line.startsWith('#') && line.trim() !== '') {
      const temp = line.trim();
      const tsUrl = generateUrl(url, temp);
      tsFileUrls.push(tsUrl);
    }
  }
  return tsFileUrls;
};

async function readFileChunks(filePath: string, chunkSize = 65536) {
  const reader = await RNBlobUtil.fs.readStream(filePath, 'base64', chunkSize);
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    // 注册数据到达事件
    reader.onData(chunk => {
      chunks.push(chunk);
    });
    // 注册错误事件
    reader.onError(error => {
      reject(error);
    });
    // 注册流结束事件
    reader.onEnd(() => {
      resolve(chunks);
    });
    // 开启流（在事件监听注册后调用）
    reader.open();
  });
}

export async function mergeTsFilesStream(
  tsFilePaths: any,
  outputFilePath: string,
) {
  // 并发读取所有文件的块数据
  const allChunks = await Promise.all(
    tsFilePaths.map((filePath: string) => readFileChunks(filePath)),
  );

  // 获取写入流对象。注意：writeStream 不需要调用 open() 方法。
  const writer = await RNBlobUtil.fs.writeStream(
    outputFilePath,
    'base64',
    false,
  );

  // 按 tsFilePaths 顺序依次写入对应文件的所有块
  for (const fileChunks of allChunks) {
    for (const chunk of fileChunks) {
      await writer.write(chunk);
    }
  }

  // 关闭写入流
  await writer.close();
  console.log('并发读取后流式合并写入成功', outputFilePath);
}

// 解析视频文件名和扩展名
export const getFileNameAndExtension = (
  url: string,
): { fileName: string; extension: string } => {
  const match = PlayPattern.exec(url);
  if (!match) {
    throw new Error('无法解析视频文件名');
  }
  const fileName = match[1];
  const extension = fileName.split('.').pop() || 'mp4'; // 默认使用mp4
  return { fileName, extension };
};

// 限制 onProgress 触发频率（节流函数）
export const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const generateUrl = (url1: string, url2: string): string => {
  // 提取输入1的路径部分
  const pathRegex = /(.*)\/[^/]+$/;
  const pathMatch = url1.match(pathRegex);
  if (!pathMatch) {
    throw new Error('Invalid URL1 format');
  }
  const basePath = pathMatch[1];

  // 提取输入2的文件名和查询参数
  const fileRegex = /^([^?]+)\?(.*)$/;
  const fileMatch = url2.match(fileRegex);
  if (!fileMatch) {
    throw new Error('Invalid URL2 format');
  }
  const fileName = fileMatch[1];
  const queryParams = fileMatch[2];

  // 构建新的URL
  let newUrl = `${basePath}/${fileName}?${queryParams}`;

  // 如果输入1有查询参数，保留输入1的查询参数
  const searchRegex = /(.*)\?(.*)/;
  const searchMatch = url1.match(searchRegex);
  if (searchMatch) {
    const url1Params = searchMatch[2];
    newUrl = `${basePath}/${fileName}?${url1Params}&${queryParams}`;
  }

  return newUrl;
};

export const parseM3U8 = async (
  url: string,
  fileName: string,
  directoryPath: string,
): Promise<[string, Array<string>]> => {
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
    },
  });

  await m3u8DownloadTask.promise;
  const tsFileUrls = await getM3u8Size(url, m3u8FilePath);

  return [m3u8FilePath, tsFileUrls];
};
