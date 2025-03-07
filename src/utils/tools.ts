export const isMp4 = (link: string): boolean => {
  return link.toLowerCase().endsWith('.mp4');
};

export const isM3u8 = (link: string): boolean => {
  return link.toLowerCase().endsWith('.m3u8');
};

export const validateLink = (link: string) => {
  if (!isMp4(link) && !isMp4(link)) {
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
