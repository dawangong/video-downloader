import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TabNavigator from './TabNavigator'; // 引入底部标签导航器
import stackRoutes from '../stackRoutes'; // 引入动态路由配置

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      {/* 添加底部标签导航器 */}
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{headerShown: false}} // 隐藏顶部导航栏
      />
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
