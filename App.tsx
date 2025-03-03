/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler'; // 确保在顶部引入
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigator from './src/router/plugins/StackNavigator';

const App = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;
