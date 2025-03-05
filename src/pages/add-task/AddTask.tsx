import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyColors from '@/constants/colors';
import useGlobalStore from '@/stores/globalStore';
import { Header } from '@/components/index';
import { Input, Button, Toast } from '@ant-design/react-native';
import { validateLink } from '@/utils/tools';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    color: MyColors.black,
    alignItems: 'center',
  },
  footer: {
    color: MyColors.gray,
  },
  wrapper: {
    padding: 6,
    flex: 1,
  },
  input: {
    width: '95%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  focusedInput: {
    borderBottomWidth: 2,
    borderColor: MyColors.primary,
  },
  button: {
    width: 90,
    height: 30,
    lineHeight: 30,
    marginTop: 20,
    backgroundColor: MyColors.primary,
    borderColor: MyColors.primary,
  },
  buttonActive: {
    backgroundColor: MyColors.primary,
    borderColor: MyColors.primary,
  },
});

const AddTask = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const pageStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const { dir } = useGlobalStore();

  const [isFocused, setIsFocused] = useState(false);
  const [link, setLink] = useState('');

  const [toastApi, contextHolder] = Toast.useToast();

  return (
    <View style={pageStyle}>
      {contextHolder}
      <Header model="setting" />
      <View style={styles.wrapper}>
        <View style={styles.body}>
          <Input
            placeholder="请输入mp4或m3u8链接, 直接下载!"
            style={[styles.input, isFocused ? styles.focusedInput : {}]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            allowClear
            onChange={(e: any) => {
              setLink(e.target.value);
            }}
          />
          <Button
            disabled={!link}
            type="primary"
            style={[styles.button]}
            activeStyle={styles.buttonActive}
            onPress={() => {
              if (validateLink(link)) {
                console.log('success');
                //
              } else {
                toastApi.show({
                  content: '请输入mp4或m3u8链接!',
                  position: 'center',
                });
              }
            }}>
            下载
          </Button>
        </View>
        <Text style={styles.footer}>保存至：{dir}</Text>
      </View>
    </View>
  );
};

export default AddTask;
