import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  useColorScheme,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { List, PickerView, Toast } from '@ant-design/react-native';
import { Dialog, Provider, Button } from 'react-native-paper';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import selectColor from '@/constants/colors';
import { selectDownloadDirectory } from '@/utils/tools';

const Item = List.Item;

const Setting = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: selectColor(isDarkMode).pageBg,
    },
    list: {
      backgroundColor: selectColor(isDarkMode).pageBg,
    },
    text: {
      color: selectColor(isDarkMode).black,
    },
    title: {
      color: selectColor(isDarkMode).black,
      fontSize: 22,
    },
    select: {
      fontSize: 16,
    },
  });

  const pageStyle = {
    flex: 1,
    backgroundColor: selectColor(isDarkMode).pageBg,
  };

  const itemStyle = {
    backgroundColor: selectColor(isDarkMode).pageBg,
    color: selectColor(isDarkMode).black,
  };

  const [toastApi, contextHolder] = Toast.useToast();

  const { dir, maxTask, setMaxTaskAndStorage, setDirAndStorage } =
    useGlobalStore();
  const [showSaveDir, setShowSaveDir] = useState(false);
  const [showTaskLimit, setShowTaskLimit] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  useEffect(() => {
    console.log(maxTask);
  }, [maxTask]);

  return (
    <Provider>
      {contextHolder}
      <View style={pageStyle}>
        <Header model="back" />
        <View style={styles.wrapper}>
          <List renderHeader="下载" style={styles.list}>
            <Item
              style={itemStyle}
              extra={dir}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  toastApi.fail({
                    content: 'IOS下无法更改下载目录',
                    position: 'center',
                    mask: false,
                  });
                } else {
                  setShowSaveDir(true);
                }
              }}>
              <Text style={styles.text}>保存位置</Text>
            </Item>
            <Item
              style={itemStyle}
              extra={String(maxTask)}
              onPress={() => {
                setShowTaskLimit(true);
              }}>
              <Text style={styles.text}>最大同时下载任务数</Text>
            </Item>
          </List>
          <List renderHeader="其他" style={styles.list}>
            <Item
              style={itemStyle}
              extra="查看"
              onPress={() => {
                setShowProtocol(true);
              }}>
              <Text style={styles.text}>隐私政策</Text>
            </Item>
            <Item style={itemStyle} extra="v1.0.0">
              <Text style={styles.text}>版本</Text>
            </Item>
          </List>
        </View>
        <Dialog visible={showSaveDir} onDismiss={() => setShowSaveDir(false)}>
          <Dialog.Title>
            <Text style={styles.title}>保存位置</Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={styles.select}
              onPress={async () => {
                setShowSaveDir(false);
                const path = await selectDownloadDirectory();
                path && setDirAndStorage(path);
              }}>
              <Text style={styles.text}>选择文件夹...</Text>
            </Text>
          </Dialog.Content>
        </Dialog>
        <Dialog
          visible={showTaskLimit}
          onDismiss={() => setShowTaskLimit(false)}>
          <Dialog.Title>
            <Text style={styles.title}>最大同时下载任务数</Text>
          </Dialog.Title>
          <Dialog.Content>
            <PickerView
              styles={{
                wrappper: {
                  backgroundColor: selectColor(isDarkMode).primary500,
                },
              }}
              onChange={(v: any) => {
                setMaxTaskAndStorage(v[0]);
              }}
              value={[maxTask]}
              data={[
                [
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 },
                ],
              ]}
              cascade={false}
            />
          </Dialog.Content>
        </Dialog>
        <Dialog visible={showProtocol} onDismiss={() => setShowProtocol(false)}>
          <Dialog.Title>
            <Text style={styles.title}>隐私政策</Text>
          </Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
              <Text style={styles.text}>
                This is a scrollable area This is a scrollable area This is a
                scrollable area This is a scrollable area This is a scrollable
                area This is a scrollable area This is a scrollable area This is
                a scrollable areaThis is a scrollable area This is a scrollable
                area This is a scrollable area This is a scrollable areaThis is
                a scrollable area This is a scrollable area This is a scrollable
                area This is a scrollable areaThis is a scrollable area This is
                a scrollable area This is a scrollable area This is a scrollable
                areaThis is a scrollable area This is a scrollable area This is
                a scrollable area This is a scrollable areaThis is a scrollable
                area This is a scrollable area This is a scrollable area This is
                a scrollable areaThis is a scrollable area This is a scrollable
                area This is a scrollable area This is a scrollable areaThis is
                a scrollable area This is a scrollable area This is a scrollable
                area This is a scrollable areaThis is a scrollable area This is
                a scrollable area This is a scrollable area This is a scrollable
                areaThis is a scrollable area This is a scrollable area This is
                a scrollable area This is a scrollable area
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Button style={{ bottom: 15 }} onPress={() => setShowProtocol(false)}>
            <Text style={{ fontSize: 18 }}>知道了</Text>
          </Button>
        </Dialog>
      </View>
    </Provider>
  );
};

export default Setting;
