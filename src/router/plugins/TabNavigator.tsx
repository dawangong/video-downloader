import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import tabRoutes from '../tabRoutes'; // 引入动态路由配置

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
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
