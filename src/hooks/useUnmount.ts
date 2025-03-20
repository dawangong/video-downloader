import { useEffect, useRef } from 'react';

const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn);

  useEffect(() => {
    const currentFn = fnRef.current; // 将 fnRef.current 的值复制到局部变量
    return () => {
      currentFn?.(); // 在清理函数中使用局部变量
    };
  }, []); // 空依赖数组确保只在组件卸载时执行
};

export default useUnmount;
