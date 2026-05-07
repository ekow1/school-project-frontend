import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
});

export default AuthCard;
