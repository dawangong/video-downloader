import { create } from 'zustand';

// 定义状态的类型
interface GlobalState {
  count: number;
  dir: string;
  maxTask: number;
  increment: () => void;
  decrement: () => void;
}

const useGlobalStore = create<GlobalState>(set => ({
  count: 0, // 初始状态
  dir: '/v-downloader',
  maxTask: 3,
  increment: () => set((state: any) => ({ count: state.count + 1 })), // 增加计数
  decrement: () => set((state: any) => ({ count: state.count - 1 })), // 减少计数
}));

export default useGlobalStore;
