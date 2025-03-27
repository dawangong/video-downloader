import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import tabRoutes from '../tabRoutes'; // 引入动态路由配置
import { Dimensions, useColorScheme, StyleSheet } from 'react-native';
import selectColor from '@/constants/colors';

const { height } = Dimensions.get('window');

// 计算动态高度
const tabBarHeight = height * 0.08; // 8% 的屏幕高度

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const styles = StyleSheet.create({
    tabBarStyle: {
      height: tabBarHeight,
      backgroundColor: selectColor(isDarkMode).pageBg,
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
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
