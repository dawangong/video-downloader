import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';
import { List } from '@ant-design/react-native';
import { Button, Dialog, Portal, Provider } from 'react-native-paper';

import { Header } from '@/components/index';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const Item = List.Item;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  modal: {},
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

  const { dir, maxTask } = useGlobalStore();
  const [showSaveDir, setShowSaveDir] = useState(false);
  const [showTaskLimit, setShowTaskLimit] = useState(false);

  return (
    <Provider>
      <View style={pageStyle}>
        <Header model="back" />
        <View style={styles.wrapper}>
          <List renderHeader="下载">
            <Item
              style={itemStyle}
              extra={dir}
              onPress={() => {
                setShowSaveDir(true);
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
            <Item style={itemStyle} extra="不进行任何采集">
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
            <Text>11</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                //
                setShowSaveDir(false);
              }}>
              取消
            </Button>
            <Button
              onPress={() => {
                //
                setShowSaveDir(false);
              }}>
              确定
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={showTaskLimit}
          onDismiss={() => setShowTaskLimit(false)}>
          <Dialog.Title>最大同时下载任务数</Dialog.Title>
          <Dialog.Content>
            <Text>22</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                //
                setShowTaskLimit(false);
              }}>
              取消
            </Button>
            <Button
              onPress={() => {
                //
                setShowTaskLimit(false);
              }}>
              确定
            </Button>
          </Dialog.Actions>
        </Dialog>
      </View>
    </Provider>
  );
};

export default Setting;
