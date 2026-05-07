import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import HomeGeneralTab from '../../components/HomeGeneralTab';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HomeGeneralTab />
      </View>
    </SafeAreaView>
  );
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', accent: '#7C2D12' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  container: {
    flex: 1,
    backgroundColor: NB.bg,
  },
});
