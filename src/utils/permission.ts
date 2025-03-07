import { PermissionsAndroid } from 'react-native-permissions';

// 请求存储权限
export const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: '存储权限',
        message: '此应用需要访问您的存储空间',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('存储权限已授予');
    } else {
      console.log('存储权限被拒绝');
    }
  } catch (err) {
    console.warn(err);
  }
};

// 检查存储权限
export const checkStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted) {
      console.log('存储权限已授予');
    } else {
      console.log('存储权限未授予');
    }
  } catch (err) {
    console.warn(err);
  }
};
