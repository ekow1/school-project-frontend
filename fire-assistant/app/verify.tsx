import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
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
      <StatusBar barStyle="dark-content" backgroundColor={NB.bg} />
      
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
              <Ionicons name="arrow-back" size={24} color={NB.border} />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Phone</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Icon Section */}
            <Animated.View style={[
              styles.iconSection,
              { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
            ]}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="shield-checkmark" size={40} color={NB.primary} />
                </View>
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
                      { transform: [{ scale: digit ? 1.05 : 1 }] }
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
                  <Ionicons name="time-outline" size={16} color={NB.muted} />
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
                <Ionicons name="alert-circle" size={16} color={NB.danger} />
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
                <Ionicons name="arrow-forward" size={20} color={NB.surface} />
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
    backgroundColor: NB.bg,
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
    fontSize: 18,
    fontWeight: '800',
    color: NB.border,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
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
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: NB.border,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: NB.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: NB.border,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  otpInputWrapper: {
    width: 56,
    height: 56,
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
  otpInputFilled: {
    borderColor: NB.primary,
    shadowColor: NB.primary,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: NB.primary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: NB.muted,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '800',
    color: NB.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: NB.muted,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.surface,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: NB.danger,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: NB.danger,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  buttonSection: {
    width: '100%',
  },
  verifyButton: {
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: NB.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: NB.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: NB.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
