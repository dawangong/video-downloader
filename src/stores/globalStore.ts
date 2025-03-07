import { create } from 'zustand';

const data = {
  fileName: '',
  progress: 35,
  downSize: 100,
  size: 437,
  chunk: 269,
  totalChunk: 763,
  status: '待定',
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
  downList: new Array(10).fill(data),
  cacheList: new Array(10).fill(data),
  changeMaxTask: v =>
    set(() => ({
      maxTask: [v[0]],
    })),
}));

export default useGlobalStore;
