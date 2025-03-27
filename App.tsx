/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler'; // 确保在顶部引入
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/router/plugins/StackNavigator';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  // NativeModules,
} from 'react-native'; // 导入需要的组件
import {
  requestStoragePermission,
  requestLocationPermission,
} from '@/utils/permission';
import { getDefaultDownloadDirectory } from '@/utils/tools';
import useGlobalStore from '@/stores/globalStore';
import { getData } from '@/utils/cache';
import { useMount } from '@/hooks/index';
import { LightColors, DarkColors } from '@/constants/colors';

// if (__DEV__) {
//   require('react-native-devsettings');
// }
// if (__DEV__) {
//   NativeModules.DevSettings.setIsDebuggingRemotely(true);
// }
if (__DEV__) {
  require('./ReactotronConfig');
}

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? DarkColors.pageBg : LightColors.pageBg;

  const { setDir, setMaxTask, maxTask: _mt } = useGlobalStore();

  // 在应用启动时调用
  useMount(() => {
    requestStoragePermission();
    requestLocationPermission();

    Promise.all([
      getData('dir'),
      getDefaultDownloadDirectory(),
      getData('maxTask'),
    ]).then((res: any) => {
      const [dir1, dir2, maxTask = _mt] = res;
      setDir(dir1 || dir2);
      setMaxTask(maxTask);
    });
    console.log('App Mounted');
  });

  return (
    <>
      {/* 设置状态栏的样式 */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      {/* 使用 SafeAreaView 包裹全局内容 */}
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

export default App;
