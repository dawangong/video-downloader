import { formatTypes } from '@/types/formatTypes';
import { ruleTypes } from '@/types/ruleTypes';

import rules from '@/constants/rules';

export const isMp4 = (link: string): boolean => {
  return link.toLowerCase().endsWith('.mp4');
};

export const formatOne = (format: formatTypes) => {
  return format.toLowerCase();
};

export const validateLink = (link: string) => {
  const res = rules.some((item: ruleTypes) =>
    link.endsWith(formatOne(item.type)),
  );
  if (!res) {
    return false;
  }
  return true;
};

export const mockApi = (duration: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, duration * 1000);
  });
};
