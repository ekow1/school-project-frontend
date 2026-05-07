import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImageUri?: string;
  style?: ViewStyle;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  backgroundImageUri = 'https://images.unsplash.com/photo-1560525483-58a8814ce752?w=1920&q=80',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: backgroundImageUri }} style={styles.bg} resizeMode="cover" />
      <View style={styles.overlay} />
      {children}
    </View>
  );
};

interface BrandSectionProps {
  title?: string;
  subtitle?: string;
}

export const BrandSection: React.FC<BrandSectionProps> = ({
  title = 'FIRE ASSISTANT',
  subtitle = 'Ghana National Fire Service',
}) => {
  return (
    <View style={styles.brand}>
      <View style={styles.logoBox}>
        <Ionicons name="flame" size={36} color="#FFFFFF" />
      </View>
      <Animated.Text style={styles.brandTitle}>{title}</Animated.Text>
      <Animated.Text style={styles.brandSubtitle}>{subtitle}</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { position: 'absolute', width, height, top: 0, left: 0 },
  overlay: {
    position: 'absolute', width, height, top: 0, left: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  brand: { alignItems: 'center', marginBottom: 24, marginTop: 40 },
  logoBox: {
    width: 76,
    height: 76,
    backgroundColor: '#C41230',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AuthLayout;
