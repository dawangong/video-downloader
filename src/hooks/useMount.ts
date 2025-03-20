import { useEffect } from 'react';

const useMount = (fn: () => void) => {
  useEffect(() => {
    fn?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组确保只在首次渲染时执行
};

export default useMount;
