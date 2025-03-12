import { VideoPattern } from '@/constants/rules';

export const validateLink = (link: string): boolean => VideoPattern.test(link);

export const sliceVideoName = (link: string): string => {
  console.log(link.match(VideoPattern));
  const res = link.match(VideoPattern)?.[1];
  return res ? res : '';
};

/**
 * 生成带有递增 id 的数组
 * @param {number} length - 数组的长度
 * @param {Object} template - 数据模板对象
 * @returns {Array} - 生成的数组
 */
export const generateArrayWithIncrementalId = (
  length: number,
  template: any,
): any => {
  return new Array(length)
    .fill(null) // 填充 null 以避免引用问题
    .map((_, index) => {
      // 为每个元素创建一个新对象，并添加递增的 id
      return { ...template, id: index + 1 };
    });
};

export const mockApi = (duration: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, duration * 1000);
  });
};
