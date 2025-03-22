import React from 'react';
import { StyleSheet, useColorScheme, View, Text, FlatList } from 'react-native';
// import { Icon, Toast } from '@ant-design/react-native';
import { Divider } from 'react-native-paper';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    color: MyColors.title,
    fontSize: 18,
    paddingInline: 10,
    paddingVertical: 6,
  },
  list: {
    paddingInline: 10,
    rowGap: 20,
  },
  item: {
    paddingVertical: 10,
    rowGap: 6,
  },
  itemText: {
    color: MyColors.black,
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const Download = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir, maxTask, downList } = useGlobalStore();

  console.log(downList, 'downList');

  return (
    <View style={pageStyle}>
      <Header model="setting" />
      <View style={styles.wrapper}>
        <Text style={styles.title}>下载页:</Text>
        <FlatList
          style={styles.list}
          data={downList}
          renderItem={({ item }) => (
            <>
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.fileName}</Text>
                <View style={styles.status}>
                  <Text>已下载: {item.progress}%</Text>
                  <Text>速度: {item.speed}mb/s</Text>
                </View>
                <View style={styles.status}>
                  <Text>已下载: {item.downSize}mb</Text>
                  <Text>总大小: {item.size}mb</Text>
                </View>
              </View>
              <Divider />
            </>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </View>
  );
};

export default Download;
