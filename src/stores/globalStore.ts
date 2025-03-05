import { create } from 'zustand';

// 定义状态的类型
interface GlobalState {
  dir: string;
  maxTask: number;
}

const useGlobalStore = create<GlobalState>((set: any, get: any) => ({
  dir: '/v-downloader',
  maxTask: 3,
  changeMaxTask: (v: number[]) =>
    set(() => ({
      maxTask: [v[0]],
    })),
}));

export default useGlobalStore;
