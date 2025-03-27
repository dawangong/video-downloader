import React from 'react';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import selectColor from '@/constants/colors';

const styles = StyleSheet.create({
  wrapper: {
    padding: 6,
    flex: 1,
  },
});

const Template = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: selectColor(isDarkMode).pageBg,
  };

  const { dir, maxTask } = useGlobalStore();

  return (
    <View style={pageStyle}>
      <Header model="setting" />
      <View style={styles.wrapper}>
        <Text>Template</Text>
      </View>
    </View>
  );
};

export default Template;
