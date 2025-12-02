import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  error: "#EF4444",
  text: "#1F2937",
  textSecondary: "#6B7280",
  success: "#10B981",
};

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('0') && digits.length === 10) {
      return '+233' + digits.substring(1);
    }
    
    if (digits.startsWith('233') && digits.length === 12) {
      return '+' + digits;
    }
    
    if (phone.startsWith('+233')) {
      return phone;
    }
    
    if (digits.length === 9) {
      return '+233' + digits;
    }
    
    return phone;
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\+233[0-9]{9}$/.test(formatPhoneNumber(value))) {
          newErrors.phone = 'Please enter a valid Ghana phone number (e.g., 0552977393)';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one number';
        } else {
          delete newErrors.password;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    if (error) clearError();
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    validateField(field, formData[field as keyof typeof formData]);
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.password) return;

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      await register({
        name: formData.name,
        phone: formattedPhone,
        password: formData.password,
      });
      
      // Show success message and redirect to login
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully. Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already handled by the store and displayed in the UI
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://res.cloudinary.com/ddwet1dzj/image/upload/v1749737356/industrial-firefighting-med-min.jpg_q1wn2h.webp'
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Top Brand Section */}
        <View style={styles.topSection}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Ionicons name="flame" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>FIRE ASSISTANT</Text>
          </View>
          
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join our community and start your fire safety journey
            </Text>
          </View>
        </View>
        
        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHandle} />
          </View>
          
          {/* Content Area */}
          <KeyboardAvoidingView 
            style={styles.cardContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
          >
            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused,
                  errors.name && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={focusedField === 'name' ? Colors.primary : Colors.textSecondary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name (e.g., John Doe)"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'phone' && styles.inputWrapperFocused,
                  errors.phone && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={focusedField === 'phone' ? Colors.primary : Colors.textSecondary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number (e.g., 0552977393)"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    maxLength={10}
                  />
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                  errors.password && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedField === 'password' ? Colors.primary : Colors.textSecondary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password (min 8 chars, uppercase, lowercase, number)"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
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
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={styles.passwordStrengthText}>Password Strength:</Text>
                    <View style={styles.passwordStrengthBar}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.passwordStrengthSegment,
                            {
                              backgroundColor: level <= passwordStrength 
                                ? passwordStrength <= 2 
                                  ? '#EF4444' 
                                  : passwordStrength <= 3 
                                    ? '#F59E0B' 
                                    : '#10B981'
                                : '#E5E7EB'
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[
                      styles.passwordStrengthLabel,
                      {
                        color: passwordStrength <= 2 
                          ? '#EF4444' 
                          : passwordStrength <= 3 
                            ? '#F59E0B' 
                            : '#10B981'
                      }
                    ]}>
                      {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : 'Strong'}
                    </Text>
                  </View>
                )}
                
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Global Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color="#FFFFFF" 
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#1A1A1A',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topSection: {
    position: 'absolute',
    top: 80,
    width: '100%',
    alignItems: 'center',
    zIndex: 0,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    marginRight: 12,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.55,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 3,
  },
  cardHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  cardHandle: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  inputContainer: {
    marginBottom: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputWrapperError: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 8,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    marginRight: 2,
    borderRadius: 2,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});