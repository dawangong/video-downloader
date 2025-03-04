import React from 'react';
import {StyleSheet, useColorScheme, View, Text} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';
import useGlobalStore from '@/stores/globalStore';

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  footer: {
    color: MyColors.gray,
  },
});

const AddTask = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    padding: 6,
  };

  const {dir} = useGlobalStore();

  return (
    <View style={pageStyle}>
      <View style={styles.body}>
        <Text>测试</Text>
      </View>
      <Text style={styles.footer}>保存至：{dir}</Text>
    </View>
  );
};

export default AddTask;
