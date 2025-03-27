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

import { Header, Loading } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { LightColors } from '@/constants/colors';
import { useMount } from '@/hooks/index';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingInline: 10,
    color: LightColors.title,
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
    alignItems: 'center',
  },
  itemText: {
    color: LightColors.black,
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
    height: 60,
    backgroundColor: LightColors.disable,
    borderRadius: 10,
  },
  empty: {
    textAlign: 'center',
    color: LightColors.tips,
  },
});

const VideoList = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir, cacheList, readLoading, updateCacheList } = useGlobalStore();
  const [toastApi, contextHolder] = Toast.useToast();

  const loadFile = async (content?: string) => {
    await updateCacheList();
    toastApi.show({
      content: content || '视频加载成功',
      position: 'center',
      mask: false,
    });
  };

  useMount(() => {
    loadFile();
  });

  console.log('readLoading', readLoading);

  return (
    <View style={pageStyle}>
      {contextHolder}
      <Header model="setting" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text>{dir}</Text>
          <Icon
            name="reload"
            color={LightColors.black}
            onPress={async () => {
              loadFile('列表刷新成功');
            }}
          />
        </View>
        {readLoading ? (
          <Loading />
        ) : cacheList.length > 0 ? (
          <FlatList
            style={styles.list}
            data={cacheList}
            renderItem={({ item }) => (
              <>
                <View style={styles.item}>
                  <Image
                    style={styles.cover}
                    source={require('@/assets/images/thumbnail.png')}
                    resizeMode="cover" // 设置为 cover 模式
                  />
                  <View style={styles.info}>
                    <Text style={styles.itemText}>{item.fileName}</Text>
                    <View style={styles.status}>
                      <Text>大小: {item.size} MB</Text>
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
        ) : (
          <Text style={styles.empty}>暂无视频</Text>
        )}
      </View>
    </View>
  );
};

export default VideoList;
