import RNFS from 'react-native-fs';
import axios from 'axios';
// @ts-ignore
import { FFmpegKit } from 'ffmpeg-kit-react-native';

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

// 下载普通视频文件
export const downloadNormalVideo = async (
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

    // 使用 RNFS.writeFile 写入文件
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      response.data.on('data', (chunk: any) => {
        chunks.push(chunk);
      });
      response.data.on('end', async () => {
        try {
          const fileData = Buffer.concat(chunks).toString('binary');
          await RNFS.writeFile(filePath, fileData, 'utf8');
          const endTime = new Date().toISOString();
          resolve({ success: true, endTime });
        } catch (err) {
          reject(err);
        }
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

// 下载并转换m3u8视频为mp4
export const downloadM3U8Video = async (
  url: string,
  directoryPath: string,
  fileName: string,
  onProgress: any,
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
        const loadedMb = (event.loaded / 1024 / 1024).toFixed(2);
        const totalMb = (event.contentLength / 1024 / 1024).toFixed(2);
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
          const loadedMb = (event.loaded / 1024 / 1024).toFixed(2);
          const totalMb = (event.contentLength / 1024 / 1024).toFixed(2);
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
