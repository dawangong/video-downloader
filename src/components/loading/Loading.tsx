import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import selectColor from '@/constants/colors';
import { useColorScheme } from 'react-native';

const Loading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: selectColor(isDarkMode).pageBg,
    },
    text: {
      marginTop: 10,
      fontSize: 16,
      color: selectColor(isDarkMode).black,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={selectColor(isDarkMode).primary500}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Loading;
