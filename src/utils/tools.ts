import { pickDirectory } from '@react-native-documents/picker';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { getRealPathFromURI } from 'react-native-get-real-path';

import { VideoPattern } from '@/constants/rules';

export const validateLink = (link: string): boolean => VideoPattern.test(link);

export const sliceVideoName = (link: string): string => {
  console.log(link.match(VideoPattern));
  const res = link.match(VideoPattern)?.[1];
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
    if (err.message === 'User cancelled') {
      console.log('User cancelled picking directory');
    } else {
      console.error('Error picking directory:', err);
    }
    return null;
  }
};

// 获取文件列表
export const getFileList = async (directoryPath: string) => {
  try {
    const files = await RNFS.readDir(directoryPath);
    return files;
  } catch (err) {
    console.error('Error getting file list:', err);
    return [];
  }
};

// 获取文件预览图
export const getPreviewImage = async (videoPath: string) => {
  try {
    const thumbnailPath = `${videoPath}_thumbnail.jpg`;
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
    const command = `ffmpeg -i ${videoPath} -ss 00:00:01 -vframes 1 ${thumbnailPath}`;
    await (RNFS as any).executeCommand(command, true);
    return thumbnailPath;
  } catch (err) {
    console.error('Error generating preview image:', err);
    return null;
  }
};
