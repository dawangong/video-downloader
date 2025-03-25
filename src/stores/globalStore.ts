import { create } from 'zustand';
import {
  downloadNormalVideo,
  downloadM3U8Video,
  OnProgressCallback,
  readVideoFiles,
} from './../utils/download';

import {
  // generateArrayWithIncrementalId,
  m3u8Link,
} from '@/utils/tools';
import { saveData } from '@/utils/cache';

// const data = {
//   fileName:
//     '测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件.mp4',
//   progress: 35,
//   downSize: 100,
//   size: 437,
//   downTime: '2025-03-05 00:20:11',
//   length: '41:25',
//   cover: 'https://reactnative.dev/img/tiny_logo.png',
//   speed: 10,
// };

// 定义状态的类型
interface GlobalState {
  dir: string;
  maxTask: number;
  downList: any[];
  cacheList: any[];
  readLoading: boolean;
  setDir(dir: string): void;
  setMaxTask(v: number): void;
  setDirAndStorage(dir: string): void;
  setMaxTaskAndStorage(v: number): void;
  downloadVideo(url: string, name: string, successFn: any): void;
  addDownList(url: string, name: string): void;
  setCacheList(list: any): void;
  updateCacheList(): void;
  updateDownList: OnProgressCallback;
  setReadLoading(isLoading: boolean): boolean;
}

const useGlobalStore = create<GlobalState>((set: any, get: any) => ({
  dir: '',
  maxTask: 1,
  // downList: generateArrayWithIncrementalId(100, data),
  // cacheList: generateArrayWithIncrementalId(100, data),
  downList: [],
  cacheList: [],
  readLoading: true,
  setDir(dir) {
    set(() => ({
      dir,
    }));
  },
  setMaxTask(v: number) {
    set(() => ({
      maxTask: v,
    }));
  },
  setDirAndStorage(dir: string) {
    set(() => ({
      dir,
    }));
    saveData('dir', dir);
  },
  setMaxTaskAndStorage(v: number) {
    set(() => ({
      maxTask: v,
    }));
    saveData('maxTask', v);
  },
  async downloadVideo(url: string, name: string, successFn: any) {
    const isM3u8 = m3u8Link(url);
    const downloadFn = isM3u8 ? downloadM3U8Video : downloadNormalVideo;
    get().addDownList(name, url);
    await downloadFn(
      url,
      name,
      get().dir,
      (_url, percentage, loadedMb, totalMb, speed) => {
        console.log('info', percentage, loadedMb, totalMb, speed);
        get().updateDownList(_url, percentage, loadedMb, totalMb, speed);
      },
    );
    const list = get().downList;
    const downList = list.filter((it: any) => it.url !== url);
    successFn(name);
    set(() => ({
      downList,
    }));
  },
  addDownList(name, url) {
    const downList = get().downList;
    downList.push({
      fileName: name,
      progress: 0,
      downSize: 0,
      size: 0,
      speed: 0,
      url,
      id: name,
    });
    set(() => ({
      downList,
    }));
  },
  updateDownList(url, percentage, loadedMb, totalMb, speed) {
    const downList = get().downList.map((it: any) => {
      if (it.url === url) {
        return {
          ...it,
          progress: percentage,
          downSize: loadedMb,
          size: totalMb,
          speed,
        };
      }
      return it;
    });
    set(() => ({
      downList,
    }));
  },
  setCacheList(list: any) {
    set(() => ({
      cacheList: list,
    }));
  },
  async updateCacheList() {
    const { dir, setCacheList, setReadLoading } = get();
    setReadLoading(true);
    const list = await readVideoFiles(dir);
    setCacheList(list);
    setReadLoading(false);
    console.log('load ok', list);
  },
  setReadLoading(v) {
    set(() => ({
      readLoading: v,
    }));
    return v;
  },
}));

export default useGlobalStore;
