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
                  fontSize: 16,
                }
              : {
                  color: props.color,
                  fontSize: 16,
                }
          }>
          新增
        </Text>
      ),
      headerShown: false,
      tabBarIcon: (props: any) => (
        <Icon
          name="plus"
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
                  fontSize: 16,
                }
              : {
                  color: props.color,
                  fontSize: 16,
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
];
