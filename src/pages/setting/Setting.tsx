import React, { useState } from 'react';
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
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';

const Item = List.Item;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  select: {
    fontSize: 16,
  },
});

const Setting = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const itemStyle = {
    // backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [toastApi, contextHolder] = Toast.useToast();

  const { dir, maxTask, changeMaxTask } = useGlobalStore();
  const [showSaveDir, setShowSaveDir] = useState(false);
  const [showTaskLimit, setShowTaskLimit] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  return (
    <Provider>
      {contextHolder}
      <View style={pageStyle}>
        <Header model="back" />
        <View style={styles.wrapper}>
          <List renderHeader="下载">
            <Item
              style={itemStyle}
              extra={dir}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  toastApi.fail({
                    content: 'IOS下无法更改下载目录',
                    position: 'bottom',
                  });
                } else {
                  setShowSaveDir(true);
                }
              }}>
              保存位置
            </Item>
            <Item
              style={itemStyle}
              extra={String(maxTask)}
              onPress={() => {
                setShowTaskLimit(true);
              }}>
              最大同时下载任务数
            </Item>
          </List>
          <List renderHeader="其他">
            <Item
              style={itemStyle}
              extra="查看"
              onPress={() => {
                setShowProtocol(true);
              }}>
              隐私政策
            </Item>
            <Item style={itemStyle} extra="v1.0.0">
              版本
            </Item>
          </List>
        </View>
        <Dialog visible={showSaveDir} onDismiss={() => setShowSaveDir(false)}>
          <Dialog.Title>保存位置</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.select}>选择文件夹...</Text>
          </Dialog.Content>
        </Dialog>
        <Dialog
          visible={showTaskLimit}
          onDismiss={() => setShowTaskLimit(false)}>
          <Dialog.Title>最大同时下载任务数</Dialog.Title>
          <Dialog.Content>
            <PickerView
              styles={{
                wrappper: {
                  backgroundColor: MyColors.primary,
                },
              }}
              onChange={(v: any) => {
                changeMaxTask(v);
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
          <Dialog.Title>隐私政策</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
              <Text>
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
            知道了
          </Button>
        </Dialog>
      </View>
    </Provider>
  );
};

export default Setting;
