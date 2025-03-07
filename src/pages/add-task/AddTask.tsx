import React, { useState } from 'react';
import { Input, Button, Toast, WingBlank } from '@ant-design/react-native';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';

import MyColors from '@/constants/colors';
import { Header } from '@/components/index';
import { validateLink, mockApi } from '@/utils/tools';
import useGlobalStore from '@/stores/globalStore';
import { Colors } from 'react-native/Libraries/NewAppScreen';

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
    height: 35,
    lineHeight: 35,
    marginTop: 20,
    backgroundColor: MyColors.primary,
    borderColor: MyColors.primary,
  },
  buttonActive: {
    backgroundColor: MyColors.primary,
    borderColor: MyColors.primary,
  },
  cButton: {
    width: 90,
    height: 35,
    lineHeight: 35,
    marginTop: 20,
    backgroundColor: MyColors.primary05,
    borderColor: MyColors.zero,
  },
  cButtonActive: {
    backgroundColor: MyColors.primary05,
    borderColor: MyColors.zero,
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
  const [fileLink, setFileLink] = useState('');
  const [analySis, setAnalySis] = useState(false);
  const [fileName, setFileName] = useState('');

  const [toastApi, contextHolder] = Toast.useToast();

  const res = true;

  return (
    <View style={pageStyle}>
      {contextHolder}
      <Header model="setting" />
      <View style={styles.wrapper}>
        <View style={styles.body}>
          <Input
            value={fileLink}
            placeholder="请输入mp4或m3u8链接, 解析下载"
            style={[styles.input, isFocused ? styles.focusedInput : {}]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            allowClear
            onChange={(e: any) => {
              setFileLink(e.target.value);
            }}
          />

          {analySis ? (
            <>
              <Input
                value={fileName}
                placeholder="请输入文件名称"
                style={[
                  styles.input,
                  isFocused ? styles.focusedInput : {},
                  { marginTop: 20 },
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                allowClear
                onChange={(e: any) => {
                  setFileName(e.target.value);
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Button
                  type="primary"
                  style={[styles.cButton]}
                  activeStyle={styles.cButtonActive}
                  onPress={async () => {
                    setFileName('');
                    setAnalySis(false);
                  }}>
                  取消
                </Button>
                <WingBlank />
                <Button
                  type="primary"
                  style={[styles.button]}
                  activeStyle={styles.buttonActive}
                  onPress={async () => {
                    if (!fileName) {
                      toastApi.fail({
                        content: '文件名不能为空',
                        position: 'bottom',
                      });
                      return false;
                    }

                    if (!fileLink) {
                      toastApi.fail({
                        content: '文件名不能为空',
                        position: 'bottom',
                      });
                      return false;
                    }

                    toastApi.success({
                      content: '新下载任务添加成功',
                      position: 'bottom',
                    });

                    setFileLink('');
                    setFileName('');
                    setAnalySis(false);
                  }}>
                  下载
                </Button>
              </View>
            </>
          ) : (
            <Button
              disabled={!fileLink}
              type="primary"
              style={[styles.button]}
              activeStyle={styles.buttonActive}
              onPress={async () => {
                if (validateLink(fileLink)) {
                  const ld = toastApi.loading({
                    content: '链接解析中...',
                    duration: 0,
                  });
                  await mockApi(3);
                  toastApi.remove(ld);
                  if (res) {
                    setAnalySis(true);
                  } else {
                    toastApi.fail({
                      content: '链接解析失败',
                      position: 'bottom',
                    });
                  }
                } else {
                  toastApi.fail({
                    content: '请输入mp4或m3u8链接',
                    position: 'bottom',
                  });
                }
              }}>
              解析
            </Button>
          )}
        </View>
        <Text style={styles.footer}>保存至：{dir}</Text>
      </View>
    </View>
  );
};

export default AddTask;
