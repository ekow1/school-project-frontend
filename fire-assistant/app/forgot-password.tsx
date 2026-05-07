import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useAlert } from '../context/AlertContext';
import { useAuthStore } from '../store/authStore';

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { forgotPassword, isLoading } = useAuthStore();
  const { showError, showSuccess } = useAlert();
  
  const [phone, setPhone] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleInputChange = (value: string) => {
    setPhone(value);
  };

  const validateForm = () => {
    if (!phone.trim()) {
      showError('Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    try {
      await forgotPassword(phone.trim());
      
      showSuccess(
        'A verification code has been sent to your phone number. Please check your messages.',
        'OTP Sent',
        () => {
          router.push({
            pathname: '/reset-password',
            params: { phone: phone.trim() }
          });
        }
      );
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send OTP. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={NB.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={NB.border} />
              </TouchableOpacity>
              <Text style={styles.title}>Forgot Password</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.form}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="lock-closed" size={32} color={NB.primary} />
                </View>
              </View>

              <Text style={styles.subtitle}>Reset your password</Text>
              <Text style={styles.description}>
                Enter your phone number and we'll send you a verification code to reset your password
              </Text>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={NB.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={NB.muted}
                    value={phone}
                    onChangeText={handleInputChange}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  container: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: NB.border,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  form: {
    flex: 1,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: NB.surface,
    borderWidth: 3,
    borderColor: NB.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NB.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: NB.border,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: NB.muted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: NB.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: NB.border,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    minWidth: 200,
    maxWidth: 280,
    ...nbShadow,
  },
  sendButtonDisabled: {
    backgroundColor: NB.muted,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: NB.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 14,
    color: NB.muted,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: NB.primary,
  },
});
