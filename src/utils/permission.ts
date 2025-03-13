import {
  Platform,
  //  Linking
} from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';

// 引导用户前往应用设置页面
// const openAppSettings = async () => {
//   await Linking.openSettings();
// };

// 存储权限
export const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      // iOS 默认访问自己应用目录，不需要额外存储权限
      return true;
    }
    const permission: any = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

    const status = await check(permission);
    if (status === RESULTS.GRANTED) {
      console.log('存储权限已授予');
      return true;
    } else if (status === RESULTS.BLOCKED) {
      console.log('存储权限被拒绝，且用户选择不再询问');
      return false;
    } else {
      console.log('存储权限未授予，开始申请权限');
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        console.log('存储权限已授予');
        return true;
      } else {
        console.log('存储权限被拒绝');
        // 引导用户手动开启权限
        // openAppSettings();
        return false;
      }
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// 定位权限
export const requestLocationPermission = async () => {
  try {
    let permission;
    if (Platform.OS === 'ios') {
      // iOS 定位权限，可以根据需求选择 LOCATION_WHEN_IN_USE 或 LOCATION_ALWAYS
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      // 因为不需要直接返回
      return true;
    }

    // 检查权限是否已经授予
    const status = await check(permission);
    if (status === RESULTS.GRANTED) {
      console.log('定位权限已授予，无需再次申请');
      return true;
    } else {
      console.log('定位权限未授予，开始申请权限');
      // 请求权限
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        console.log('定位权限已授予');
        return true;
      } else {
        console.log('定位权限被拒绝');
        return false;
      }
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
