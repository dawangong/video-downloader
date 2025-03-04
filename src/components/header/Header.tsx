import MyColors from '@/constants/colors';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { Icon } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

// 计算动态高度
const headerHeight = height * 0.06;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: headerHeight,
    backgroundColor: MyColors.primary, // 设置导航栏背景颜色
    paddingLeft: 6,
    paddingRight: 6,
  },
  text: {
    color: MyColors.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
});

interface Props {
  showSetting?: boolean;
}

const Header = (props: Props) => {
  const { showSetting = false } = props;
  const navigation = useNavigation<any>();

  const onPress = () => {
    navigation.navigate('Setting');
  };

  return (
    <View style={styles.header}>
      <Text style={styles.text}>VDownloader</Text>
      {showSetting && (
        <Icon
          name="setting"
          color={MyColors.white}
          size={24}
          onPress={onPress}
        />
      )}
    </View>
  );
};

export default Header;
