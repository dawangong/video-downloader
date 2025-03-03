export default [
  {
    name: 'Add',
    component: () => import('../pages/add-task/AddTask'),
    options: {
      tabBarLabel: '新增',
    },
  },
  {
    name: 'Download',
    component: () => import('../pages/download/Download'),
    options: {
      tabBarLabel: '下载',
    },
  },
];
