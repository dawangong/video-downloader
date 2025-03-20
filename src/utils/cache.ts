import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存数据
const saveData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// 获取数据
const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error getting data:', error);
  }
  return null;
};

// 删除数据
const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log('Data removed successfully');
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

export { saveData, getData, removeData };
