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

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) clearError();
    
    if (value && index < 5) {
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
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP code');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!phone) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      const otpCode = otp.join('');
      await resetPassword(phone, otpCode, password);
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={NB.bg} />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={NB.border} />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <View style={styles.form}>
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="key" size={32} color={NB.primary} />
              </View>
            </View>

            <Text style={styles.subtitle}>Create new password</Text>
            <Text style={styles.description}>
              Enter the verification code sent to your phone and create a new password
            </Text>

            {/* Phone Display */}
            {phone && (
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneLabel}>Phone Number</Text>
                <Text style={styles.phoneText}>{phone}</Text>
              </View>
            )}

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Verification Code</Text>
              <View style={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <View key={index} style={styles.otpInputWrapper}>
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
                  </View>
                ))}
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={NB.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={NB.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={NB.muted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={NB.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={NB.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={NB.muted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={NB.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
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
  form: {
    flex: 1,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '600',
  },
  phoneContainer: {
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  phoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NB.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: NB.border,
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: NB.border,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  otpInputWrapper: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  otpInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: NB.primary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
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
    paddingVertical: 12,
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
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: NB.danger,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    ...nbShadow,
  },
  resetButtonDisabled: {
    backgroundColor: NB.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: NB.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});