import MyColors from '@/constants/colors';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { Icon } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

// 计算动态高度
const headerHeight = height * 0.06;

const styles = StyleSheet.create({
  header: {
    height: headerHeight,
    backgroundColor: MyColors.primary, // 设置导航栏背景颜色
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  all: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  text: {
    color: MyColors.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  settingIcon: {
    marginLeft: 200,
  },
});

interface Props {
  model?: 'title' | 'setting' | 'back' | 'all';
}

const Header = (props: Props) => {
  const { model = 'title' } = props;
  const navigation = useNavigation<any>();

  const back = (
    <Icon
      name="left"
      color={MyColors.white}
      size={24}
      onPress={() => navigation.goBack()}
      style={styles.backIcon}
    />
  );
  const title = <Text style={styles.text}>VDownloader</Text>;

  const setting = (right?: boolean) =>
    right ? (
      <Icon
        name="setting"
        color={MyColors.white}
        size={24}
        onPress={() => navigation.navigate('Setting')}
        style={styles.settingIcon}
      />
    ) : (
      <Icon
        name="setting"
        color={MyColors.white}
        size={24}
        onPress={() => navigation.navigate('Setting')}
      />
    );

  const maps = {
    title: <View style={styles.title}>{title}</View>,
    setting: (
      <View style={styles.setting}>
        {title}
        {setting()}
      </View>
    ),
    back: (
      <View style={styles.back}>
        {back}
        {title}
      </View>
    ),
    all: (
      <View style={styles.all}>
        {back}
        {title}
        {setting(true)}
      </View>
    ),
  };

  return <View style={styles.header}>{maps[model]}</View>;
};

export default Header;
