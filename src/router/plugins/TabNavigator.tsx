import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import tabRoutes from '../tabRoutes'; // 引入动态路由配置
import {Dimensions} from 'react-native';

const {height} = Dimensions.get('window');

// 计算动态高度
const tabBarHeight = height * 0.08; // 8% 的屏幕高度

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: tabBarHeight,
        },
      }}>
      {tabRoutes.map((route, index) => (
        <Tab.Screen
          key={index}
          name={route.name}
          component={React.lazy(route.component)}
          options={route.options}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNavigator;
