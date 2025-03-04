import {Icon} from '@ant-design/react-native';
import {Text} from 'react-native';
import Colors from '@/constants/colors';

export default [
  {
    name: 'Add',
    component: () => import('../pages/add-task/AddTask'),
    options: {
      tabBarLabel: (props: any) => (
        <Text
          style={
            props.focused
              ? {
                  color: Colors.primary,
                  fontSize: 15,
                }
              : {
                  color: props.color,
                  fontSize: 15,
                }
          }>
          新增
        </Text>
      ),
      headerShown: false,
      tabBarIcon: (props: any) => (
        <Icon
          name="plus-circle"
          color={props.focused ? Colors.primary : props.color}
          size={props.size}
        />
      ),
    },
  },
  {
    name: 'Download',
    component: () => import('../pages/download/Download'),
    options: {
      tabBarLabel: (props: any) => (
        <Text
          style={
            props.focused
              ? {
                  color: Colors.primary,
                  fontSize: 15,
                }
              : {
                  color: props.color,
                  fontSize: 15,
                }
          }>
          下载
        </Text>
      ),
      headerShown: false,
      tabBarIcon: (props: any) => (
        <Icon
          name="download"
          color={props.focused ? Colors.primary : props.color}
          size={props.size}
        />
      ),
    },
  },
  {
    name: 'Video',
    component: () => import('../pages/video-list/VideoList'),
    options: {
      tabBarLabel: (props: any) => (
        <Text
          style={
            props.focused
              ? {
                  color: Colors.primary,
                  fontSize: 15,
                }
              : {
                  color: props.color,
                  fontSize: 15,
                }
          }>
          视频
        </Text>
      ),
      headerShown: false,
      tabBarIcon: (props: any) => (
        <Icon
          name="file-sync"
          color={props.focused ? Colors.primary : props.color}
          size={props.size}
        />
      ),
    },
  },
];
