import React from 'react';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const styles = StyleSheet.create({
  wrapper: {
    padding: 6,
    flex: 1,
  },
});

const Setting = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir, maxTask } = useGlobalStore();

  return (
    <View style={pageStyle}>
      <Header model="back" />
      <View style={styles.wrapper}>
        <Text>设置页</Text>
      </View>
    </View>
  );
};

export default Setting;
