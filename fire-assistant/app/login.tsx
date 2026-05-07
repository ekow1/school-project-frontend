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
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { AuthLayout, BrandSection } from '../components/auth';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthLink, FormButton, FormDivider, FormInput, PasswordInput } from '../components/form';
import { useAlert } from '../context/AlertContext';
import { useAuthStore } from '../store/authStore';
import {
  calculatePasswordStrength,
  formatPhoneNumber,
  validatePhoneNumber
} from '../utils/validation';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const { showError } = useAlert();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!validatePhoneNumber(value)) {
          newErrors.phone = 'Please enter a valid Ghana phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    validateField(field, formData[field as keyof typeof formData]);
  };

  const handleLogin = async () => {
    if (!formData.phone || !formData.password) {
      showError('Please fill in all fields');
      return;
    }

    const phoneError = errors.phone;
    const passwordError = errors.password;

    if (phoneError || passwordError) {
      showError(phoneError || passwordError || 'Please fix the errors in the form');
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      await login(formattedPhone, formData.password);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <AuthLayout>
          {/* Animated Content */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo and Brand */}
            <BrandSection />

            {/* Login Card */}
            <AuthCard>
              <Text style={styles.loginTitle}>Welcome Back</Text>
              <Text style={styles.loginSubtitle}>Sign in to continue</Text>

              {/* Form */}
              <KeyboardAvoidingView
                style={styles.form}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                {/* Phone Input */}
                <FormInput
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  icon="call-outline"
                  placeholder="0551234567"
                  error={errors.phone}
                  focused={focusedField === 'phone'}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                {/* Password Input */}
                <PasswordInput
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  error={errors.password}
                  focused={focusedField === 'password'}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  showStrength={true}
                  maxStrength={4}
                />

                {/* Login Button */}
                <FormButton
                  title={isLoading ? 'Signing In...' : 'Sign In'}
                  onPress={handleLogin}
                  isLoading={isLoading}
                  icon="arrow-forward"
                  iconPosition="right"
                />

                {/* Divider */}
                <FormDivider text="or" />

                {/* Officer Login */}
                <TouchableOpacity
                  style={styles.officerButton}
                  onPress={() => router.push('/officer-login')}
                >
                  <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                  <Text style={styles.officerButtonText}>Login as Fire Officer</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>

                {/* Links */}
                <View style={styles.linksContainer}>
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up */}
                <AuthLink
                  text="Don't have an account?"
                  linkText="Sign Up"
                  onPress={() => router.push('/register')}
                  style={styles.signupRow}
                />
              </KeyboardAvoidingView>
            </AuthCard>
          </Animated.View>
        </AuthLayout>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.secondary },
  container: { flex: 1 },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  loginTitle: { fontSize: 22, fontWeight: '800', color: Colors.secondary, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  loginSubtitle: { fontSize: 13, color: Colors.tertiary, textAlign: 'center', marginBottom: 24, fontWeight: '600' },
  form: { width: '100%' },
  officerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.secondary,
    marginBottom: 14,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  officerButtonText: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginLeft: 8, marginRight: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  linksContainer: { alignItems: 'center', marginBottom: 14 },
  linkText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  signupRow: { justifyContent: 'center' },
});
