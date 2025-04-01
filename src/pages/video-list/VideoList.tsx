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
import selectColor from '@/constants/colors';
import { useMount } from '@/hooks/index';

const VideoList = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingInline: 10,
      color: selectColor(isDarkMode).black,
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
      color: selectColor(isDarkMode).black,
    },
    info: {
      marginLeft: 10,
      flex: 1,
    },
    status: {
      flexDirection: 'row',
      columnGap: 20,
    },
    text: {
      color: selectColor(isDarkMode).black,
    },
    cover: {
      width: 80,
      height: 60,
      backgroundColor: selectColor(isDarkMode).disable,
      borderRadius: 10,
    },
    empty: {
      textAlign: 'center',
      color: selectColor(isDarkMode).tips,
    },
  });

  const pageStyle = {
    flex: 1,
    backgroundColor: selectColor(isDarkMode).pageBg,
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
          <Text style={styles.text}>{dir}</Text>
          <Icon
            name="reload"
            color={selectColor(isDarkMode).black}
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
                      <Text style={styles.text}>大小: {item.size} MB</Text>
                      <Text style={styles.text}>时长: {item.length}</Text>
                    </View>
                    <Text style={styles.text}>下载于: {item.downTime}</Text>
                  </View>
                </View>
                <Divider />
              </>
            )}
            keyExtractor={item => item.id}
          />
        ) : (<View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.empty}>暂无视频</Text>
             </View>
        )}
      </View>
    </View>
  );
};

export default VideoList;
