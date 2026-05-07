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
import { AuthLayout, BrandSection } from '../components/auth';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthLink, FormButton, FormDivider, FormInput, PasswordInput } from '../components/form';
import { BorderRadius, Colors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import {
  calculatePasswordStrength,
  formatPhoneNumber,
  validateName,
  validatePassword,
  validatePhoneNumber
} from '../utils/validation';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
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
    if (error) clearError();

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    let fieldError: string | null = null;

    switch (field) {
      case 'name':
        fieldError = validateName(value);
        break;
      case 'phone':
        if (!value.trim()) {
          fieldError = 'Phone number is required';
        } else if (!validatePhoneNumber(value)) {
          fieldError = 'Please enter a valid Ghana phone number';
        }
        break;
      case 'password':
        fieldError = validatePassword(value);
        break;
    }

    if (fieldError) {
      newErrors[field] = fieldError;
    } else {
      delete newErrors[field];
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

  const handleRegister = async () => {
    // Validate all fields
    const nameError = validateName(formData.name);
    const phoneError = !formData.phone.trim() ? 'Phone number is required' :
      !validatePhoneNumber(formData.phone) ? 'Please enter a valid Ghana phone number' : null;
    const passwordError = validatePassword(formData.password);

    const allErrors = {
      ...(nameError && { name: nameError }),
      ...(phoneError && { phone: phoneError }),
      ...(passwordError && { password: passwordError }),
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      await register({
        name: formData.name,
        phone: formattedPhone,
        password: formData.password,
      });
    } catch (err) {
      console.error('Registration error:', err);
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
            {/* Brand Section */}
            <BrandSection />

            {/* Register Card */}
            <AuthCard>
              <Text style={styles.loginTitle}>Create Account</Text>
              <Text style={styles.loginSubtitle}>Join our fire safety community</Text>

              {/* Form */}
              <KeyboardAvoidingView
                style={styles.form}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                {/* Name Input */}
                <FormInput
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  icon="person-outline"
                  placeholder="Enter your full name"
                  error={errors.name}
                  focused={focusedField === 'name'}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  autoCapitalize="words"
                  autoCorrect={false}
                />

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
                  maxStrength={5}
                />

                {/* Global Error Message */}
                {error && (
                  <View style={styles.generalError}>
                    <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                    <Text style={styles.generalErrorText}>{error}</Text>
                  </View>
                )}

                {/* Register Button */}
                <FormButton
                  title={isLoading ? 'Creating...' : 'Create Account'}
                  onPress={handleRegister}
                  isLoading={isLoading}
                  icon="arrow-forward"
                  iconPosition="right"
                />

                {/* Divider */}
                <FormDivider text="or" />

                {/* Login Link */}
                <AuthLink
                  text="Already have an account?"
                  linkText="Sign In"
                  onPress={() => router.push('/login')}
                  style={styles.loginLink}
                />

                {/* Officer Login */}
                <TouchableOpacity
                  style={styles.officerButton}
                  onPress={() => router.push('/officer-login')}
                >
                  <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                  <Text style={styles.officerButtonText}>Login as Fire Officer</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </AuthCard>
          </Animated.View>
        </AuthLayout>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginSubtitle: {
    fontSize: 13,
    color: Colors.tertiary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningAlpha,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
  },
  generalErrorText: {
    fontSize: 14,
    color: Colors.danger,
    marginLeft: 8,
    flex: 1,
  },
  loginLink: {
    marginBottom: 16,
  },
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
  officerButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 8,
    marginRight: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
