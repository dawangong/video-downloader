import React from 'react';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';
import useGlobalStore from '@/stores/globalStore';
import { Header } from '@/components/index';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    color: MyColors.black,
  },
  footer: {
    color: MyColors.gray,
  },
  wrapper: {
    padding: 6,
    flex: 1,
  },
});

const AddTask = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir } = useGlobalStore();

  return (
    <View style={pageStyle}>
      <Header model="setting" />
      <View style={styles.wrapper}>
        <View style={styles.body}>
          <Text>测试</Text>
        </View>
        <Text style={styles.footer}>保存至：{dir}</Text>
      </View>
    </View>
  );
};

export default AddTask;
