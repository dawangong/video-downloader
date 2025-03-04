import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TabNavigator from './TabNavigator'; // 引入底部标签导航器
import stackRoutes from '../stackRoutes'; // 引入动态路由配置
import Colors from '@/constants/colors';
import {Dimensions} from 'react-native';

const {height} = Dimensions.get('window');

// 计算动态高度
const headerHeight = height * 0.06;

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerTitle: 'VDownloader',
        // 配置通用的顶部导航栏
        headerStyle: {
          backgroundColor: Colors.primary, // 设置导航栏背景颜色
          height: headerHeight,
        },
        headerTintColor: '#fff', // 设置导航栏文字颜色
        headerTitleStyle: {
          fontWeight: 'bold', // 设置标题样式
        },
        headerTitleAlign: 'left',
        headerShown: true, // 默认显示导航栏
      }}>
      {/* 添加底部标签导航器 */}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {/* 动态加载的路由 */}
      {stackRoutes.map((route, index) => (
        <Stack.Screen
          key={index}
          name={route.name}
          component={React.lazy(route.component)}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

export default StackNavigator;
