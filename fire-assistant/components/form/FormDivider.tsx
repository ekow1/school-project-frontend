import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface FormDividerProps {
  text?: string;
  style?: ViewStyle;
}

export const FormDivider: React.FC<FormDividerProps> = ({ text = 'or', style }) => {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.line} />
      <Text style={styles.text}>{text.toUpperCase()}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 2, backgroundColor: '#1A1A1A' },
  text: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '800',
    marginHorizontal: 14,
    letterSpacing: 1.5,
  },
});

export default FormDivider;
