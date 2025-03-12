import { VideoPattern } from '@/constants/rules';

export const validateLink = (link: string): boolean => VideoPattern.test(link);

export const sliceVideoName = (link: string): string => {
  console.log(link.match(VideoPattern));
  const res = link.match(VideoPattern)?.[1];
  return res ? res : '';
};

export const mockApi = (duration: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, duration * 1000);
  });
};
