import React from 'react';
import { StyleSheet, useColorScheme, View, Text, FlatList } from 'react-native';
// import { Icon, Toast } from '@ant-design/react-native';
import { Button, Toast } from '@ant-design/react-native';
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
  empty: {
    textAlign: 'center',
    color: MyColors.tips,
  },
});

const Download = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { downList, downloadVideo } = useGlobalStore();
  const [toastApi, contextHolder] = Toast.useToast();

  return (
    <View style={pageStyle}>
      {contextHolder}
      <Header model="setting" />
      <View style={styles.wrapper}>
        <Text style={styles.title}>下载页:</Text>
        {downList.length > 0 ? (
          <FlatList
            style={styles.list}
            data={downList}
            renderItem={({ item }) => (
              <>
                {item.status === 'error' ? (
                  <Button
                    type="warning"
                    onPress={async () => {
                      downloadVideo(item.url, item.fileName, (name: string) => {
                        toastApi.success({
                          content: `${name}下载完成`,
                          position: 'center',
                          mask: false,
                        });
                      });
                    }}>
                    重试
                  </Button>
                ) : (
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
                )}
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

export default Download;
