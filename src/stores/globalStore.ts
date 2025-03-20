import { create } from 'zustand';

import { generateArrayWithIncrementalId } from '@/utils/tools';
import { saveData } from '@/utils/cache';

const data = {
  fileName:
    '测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件.mp4',
  progress: 35,
  downSize: 100,
  size: 437,
  downTime: '2025-03-05 00:20:11',
  length: '41:25',
  cover: 'https://reactnative.dev/img/tiny_logo.png',
  speed: 10,
};

// 定义状态的类型
interface GlobalState {
  dir: string;
  maxTask: number;
  downList: any[];
  cacheList: any[];
  setDir(dir: string): void;
  setMaxTask(v: number): void;
  setDirAndStorage(dir: string): void;
  setMaxTaskAndStorage(v: number): void;
}

const useGlobalStore = create<GlobalState>((set: any, get: any) => ({
  dir: '',
  maxTask: 1,
  downList: generateArrayWithIncrementalId(100, data),
  cacheList: generateArrayWithIncrementalId(100, data),
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
}));

export default useGlobalStore;
