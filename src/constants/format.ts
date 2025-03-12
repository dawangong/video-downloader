import { ruleTypes } from '@/types/ruleTypes';

const Format: Array<ruleTypes> = [
  {
    type: 'mp4',
    desc: '广泛用于网络视频平台',
  },
  {
    type: 'm3u8',
    desc: '大多数在线视频平台',
  },
  {
    type: 'flv',
    desc: '曾广泛用于早期的视频分享网站',
  },
  {
    type: 'avi',
    desc: '常用于本地存储和离线观看',
  },
  {
    type: 'mov',
    desc: '常用于苹果设备',
  },
  {
    type: 'mkv',
    desc: '常用于高清电影和电视剧的下载和分享',
  },
  {
    type: 'wmv',
    desc: '常用于Windows系统下的视频分享和网络视频平台',
  },
  {
    type: 'webm',
    desc: '常用于现代浏览器中的视频播放',
  },
];

export default Format;
