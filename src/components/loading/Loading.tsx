import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MyColors from '@/constants/colors';

const Loading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={MyColors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Loading;
