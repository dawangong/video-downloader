import { pickDirectory } from '@react-native-documents/picker';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
// @ts-ignore
import { getThumbnail } from 'react-native-thumbnail-video';

import { VideoPattern, M3U8Pattern } from '@/constants/rules';

// 验证链接
export const validateLink = (link: string): boolean => VideoPattern.test(link);

// 验证m3u8链接
export const m3u8Link = (link: string): boolean => M3U8Pattern.test(link);

// 截取默认名称
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

// 生成合法路径的函数
// export const generateValidPath = (
//   userDefinedPath: string,
//   fileName: string,
// ): string => {
//   // 获取外部存储路径
//   const externalStoragePath = RNFS.ExternalStorageDirectoryPath;

//   // 提取用户自定义路径中 /storage/emulated/0 之后的部分
//   const userPathParts = userDefinedPath.split('/storage/emulated/0/');
//   const relativePath = userPathParts.length > 1 ? userPathParts[1] : '';

//   // 拼接完整的路径
//   const fullPath = `${externalStoragePath}/${relativePath}${fileName}`;

//   return fullPath;
// };

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
    const thumbnailPath = `${RNFS.DocumentDirectoryPath}/thumbnail.jpg`;
    // 使用 react-native-thumbnail-video 获取缩略图
    const result = await getThumbnail(videoPath, thumbnailPath, 1000); // 1000 毫秒处的帧
    return result.path;
  } catch (err) {
    console.error('Error generating preview image:', err);
    return null;
  }
};
