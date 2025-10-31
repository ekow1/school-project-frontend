import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#D32F2F",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
  text: "#FFFFFF",
  textSecondary: "#F5F5F5",
  accent: "#3B82F6",
};

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const { verifyPhone, isLoading, error, clearError } = useAuthStore();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) clearError();
    
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP code');
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    try {
      const otpCode = otp.join('');
      await verifyPhone(phone || '', otpCode);
      
      Alert.alert(
        'Verification Successful',
        'Your phone number has been verified successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleResendOtp = async () => {
    if (!phone) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }

    try {
      setIsResending(true);
      await verifyPhone(phone, '');
      setResendTimer(60);
      Alert.alert('OTP Sent', `A new verification code has been sent to ${phone}`);
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Phone</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Icon Section */}
            <Animated.View style={[
              styles.iconSection,
              { 
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
                </View>
                <View style={styles.iconGlow} />
              </View>
            </Animated.View>

            {/* Text Section */}
            <Animated.View style={[
              styles.textSection,
              { transform: [{ translateY: slideAnim }] }
            ]}>
              <Text style={styles.subtitle}>Verify Your Phone</Text>
              <Text style={styles.description}>
                {phone 
                  ? `We've sent a 4-digit verification code to ${phone}`
                  : "We've sent a 4-digit verification code to your phone number"
                }
              </Text>
            </Animated.View>

            {/* OTP Section */}
            <Animated.View style={[
              styles.otpSection,
              { transform: [{ translateY: slideAnim }] }
            ]}>
              <Text style={styles.otpLabel}>Enter Verification Code</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.otpInputWrapper,
                      digit && styles.otpInputFilled,
                      { transform: [{ scale: digit ? 1.1 : 1 }] }
                    ]}
                  >
                    <TextInput
                      ref={(ref) => {
                        if (ref) inputRefs.current[index] = ref;
                      }}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>

            {/* Resend Section */}
            <Animated.View style={[
              styles.resendSection,
              { transform: [{ translateY: slideAnim }] }
            ]}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {resendTimer > 0 ? (
                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
                  <Text style={styles.resendLink}>
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Error Message */}
            {error && (
              <Animated.View style={[
                styles.errorContainer,
                { transform: [{ translateY: slideAnim }] }
              ]}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Verify Button */}
            <Animated.View style={[
              styles.buttonSection,
              { transform: [{ translateY: slideAnim }] }
            ]}>
              <TouchableOpacity
                style={[
                  styles.verifyButton, 
                  isLoading && styles.verifyButtonDisabled,
                  otp.join('').length !== 4 && styles.verifyButtonDisabled
                ]}
                onPress={handleVerify}
                disabled={isLoading || otp.join('').length !== 4}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  otpInputWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInputFilled: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textDecorationLine: 'underline',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  buttonSection: {
    width: '100%',
  },
  verifyButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});