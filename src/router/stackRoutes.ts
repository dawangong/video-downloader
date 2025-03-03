export default [
  {
    name: 'Setting',
    component: () => import('../pages/setting/Setting'),
    options: {
      title: '设置页',
      headerShown: false,
    },
  },
  {
    name: 'VideoList',
    component: () => import('../pages/video-list/VideoList'),
    options: {
      title: '视频页',
    },
  },
  // 添加更多路由配置
];
