import { create } from 'zustand';

import { generateArrayWithIncrementalId } from '@/utils/tools';

const data = {
  fileName:
    '测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件测试文件.mp4',
  progress: 35,
  downSize: 100,
  size: 437,
  downTime: '2025-03-05 00:20:11',
  length: '41:25',
  cover: '图片',
};

// 定义状态的类型
interface GlobalState {
  dir: string;
  maxTask: number;
  changeMaxTask(v: number[]): void;
  downList: any[];
  cacheList: any[];
}

const useGlobalStore = create<GlobalState>((set: any, get: any) => ({
  dir: '/v-downloader',
  maxTask: 3,
  downList: generateArrayWithIncrementalId(100, data),
  cacheList: generateArrayWithIncrementalId(100, data),
  changeMaxTask: v =>
    set(() => ({
      maxTask: [v[0]],
    })),
}));

export default useGlobalStore;
