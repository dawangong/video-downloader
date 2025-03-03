import {Icon} from '@ant-design/react-native';

export default [
  {
    name: 'Add',
    component: () => import('../pages/add-task/AddTask'),
    options: {
      tabBarLabel: '新增',
      headerShown: false,
      tabBarIcon: ({focused, color, size}) => (
        <Icon name="plus" color={focused ? '#007bff' : color} size={size} />
      ),
    },
  },
  {
    name: 'Download',
    component: () => import('../pages/download/Download'),
    options: {
      tabBarLabel: '下载',
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => (
        <Icon name="download" color={focused ? '#007bff' : color} size={size} />
      ),
    },
  },
];
