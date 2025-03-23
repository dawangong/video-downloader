import React from 'react';
import {
  StyleSheet,
  useColorScheme,
  View,
  Text,
  FlatList,
  Image,
} from 'react-native';
import { Icon, Toast } from '@ant-design/react-native';
import { Divider } from 'react-native-paper';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingInline: 10,
    color: MyColors.title,
    fontSize: 18,
    paddingVertical: 6,
  },
  list: {
    paddingInline: 10,
    rowGap: 20,
  },
  item: {
    paddingVertical: 10,
    rowGap: 6,
    flexDirection: 'row',
  },
  itemText: {
    color: MyColors.black,
  },
  info: {
    marginLeft: 10,
    flex: 1,
  },
  status: {
    flexDirection: 'row',
    columnGap: 20,
  },
  cover: {
    width: 80,
    backgroundColor: MyColors.disable,
    borderRadius: 10,
  },
});

const VideoList = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir, cacheList } = useGlobalStore();
  const [toastApi, contextHolder] = Toast.useToast();

  return (
    <View style={pageStyle}>
      {contextHolder}
      <Header model="setting" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text>{dir}</Text>
          <Icon
            name="reload"
            color={MyColors.black}
            onPress={() => {
              toastApi.show({
                content: '列表刷新成功',
                position: 'center',
                mask: false,
              });
            }}
          />
        </View>
        <FlatList
          style={styles.list}
          data={cacheList}
          renderItem={({ item }) => (
            <>
              <View style={styles.item}>
                <Image style={styles.cover} source={item.cover} />
                <View style={styles.info}>
                  <Text style={styles.itemText}>{item.fileName}</Text>
                  <View style={styles.status}>
                    <Text>大小: {item.size}MB</Text>
                    <Text>时长: {item.length}</Text>
                  </View>
                  <Text>下载于: {item.downTime}</Text>
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

export default VideoList;
