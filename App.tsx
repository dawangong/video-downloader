/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler'; // 确保在顶部引入
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/router/plugins/StackNavigator';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native'; // 导入需要的组件
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  requestStoragePermission,
  requestLocationPermission,
} from '@/utils/permission';
import { getDefaultDownloadDirectory } from '@/utils/tools';
import useGlobalStore from '@/stores/globalStore';

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { setDir } = useGlobalStore();

  // 在应用启动时调用
  useEffect(() => {
    requestStoragePermission();
    requestLocationPermission();
    getDefaultDownloadDirectory().then(res => {
      setDir(res as string);
    });
  }, [setDir]);

  return (
    <>
      {/* 设置状态栏的样式 */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {/* 使用 SafeAreaView 包裹全局内容 */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

export default App;
