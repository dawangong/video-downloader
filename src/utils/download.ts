import RNFS from 'react-native-fs';
import axios from 'axios';

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

// 下载视频文件
export const downloadVideo = async (
  url: string,
  directoryPath: string,
  fileName: string,
  onProgress: any,
) => {
  try {
    let startTime = new Date().getTime(); // 开始时间
    let lastLoaded = 0; // 上一次已下载的字节数
    let lastTime = startTime; // 上一次时间戳

    const response = await axios.get(url, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent: any) => {
        const total = progressEvent.total;
        const loaded = progressEvent.loaded;
        const percentage = (loaded / total) * 100;
        const totalMb = (total / 1024 / 1024).toFixed(2);
        const loadedMb = (loaded / 1024 / 1024).toFixed(2);

        // 计算下载速度
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTime; // 时间差（毫秒）
        const loadedDiff = loaded - lastLoaded; // 数据量差（字节）

        let speed = 0;
        if (timeDiff > 0 && loadedDiff > 0) {
          speed = loadedDiff / 1024 / 1024 / (timeDiff / 1000); // MB/s
        }

        // 更新上次的时间和已下载字节数
        lastTime = currentTime;
        lastLoaded = loaded;

        onProgress(percentage, loadedMb, totalMb, speed.toFixed(2)); // 传递下载速度
      },
    });

    const filePath = `${directoryPath}/${fileName}`;
    await RNFS.mkdir(directoryPath); // 确保目录存在
    return new Promise((resolve, reject) => {
      const file = (RNFS as any).createFile(filePath);
      response.data.pipe(file);
      response.data.on('end', () => {
        const endTime = new Date().toISOString();
        resolve({ success: true, endTime });
      });
      response.data.on('error', (err: any) => {
        reject(err);
      });
    });
  } catch (err) {
    console.error('Error downloading video:', err);
    return { success: false, error: err };
  }
};
