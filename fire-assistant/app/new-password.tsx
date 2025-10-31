"use client"

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../components/CustomAlert';

export default function NewPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const handleResetPassword = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in both password fields.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    
    if (password.length < 6) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'The passwords you entered do not match.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    
    // Success
    setAlertConfig({
      visible: true,
      type: 'success',
      title: 'Password Reset Successful',
      message: 'Your password has been reset successfully. You can now login with your new password.',
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        router.push('/login');
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#D32F2F" />
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={64} color="#fff" />
            </View>
            
            {/* Title & Subtitle */}
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>

            {/* Password Input */}
            <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputFocused,
              password.length > 0 && styles.inputFilled
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={passwordFocused ? "#fff" : "rgba(255, 255, 255, 0.7)"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                accessibilityLabel="New Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={passwordFocused ? "#fff" : "rgba(255, 255, 255, 0.7)"} 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[
              styles.inputWrapper,
              confirmPasswordFocused && styles.inputFocused,
              confirmPassword.length > 0 && styles.inputFilled
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={confirmPasswordFocused ? "#fff" : "rgba(255, 255, 255, 0.7)"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                secureTextEntry={!showConfirmPassword}
                accessibilityLabel="Confirm Password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={confirmPasswordFocused ? "#fff" : "rgba(255, 255, 255, 0.7)"} 
                />
              </TouchableOpacity>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.push('/login')}>
              <Ionicons name="arrow-back" size={20} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        
        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={alertConfig.onConfirm}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D32F2F',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: '#D32F2F',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    height: 58,
    width: '100%',
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inputFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginLeft: 8,
  },
});

