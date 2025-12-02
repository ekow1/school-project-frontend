import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function OfficerLoginScreen() {
   const [formData, setFormData] = useState({
     serviceNumber: '',
     password: '',
   });

   const [showPassword, setShowPassword] = useState(false);
   const [errors, setErrors] = useState<{[key: string]: string}>({});
   const [focusedField, setFocusedField] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   // Temporary password reset state
   const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
   const [officerData, setOfficerData] = useState<{id: string, serviceNumber: string} | null>(null);
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'serviceNumber':
        if (!value.trim()) {
          newErrors.serviceNumber = 'Service number is required';
        } else if (value.length < 3) {
          newErrors.serviceNumber = 'Service number must be at least 3 characters';
        } else {
          delete newErrors.serviceNumber;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    validateField(field, formData[field as keyof typeof formData]);
  };

  const handleOfficerLogin = async () => {
    if (!formData.serviceNumber || !formData.password) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Officer login:', { serviceNumber: formData.serviceNumber, password: '***' });

      const response = await axios.post(`${ENV.AUTH_API_URL}/fire/personnel/login`, {
        serviceNumber: formData.serviceNumber,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Officer login response:', response.status, response.data);

      const { token, user, requiresPasswordChange } = response.data;

      if (requiresPasswordChange) {
        // Temporary password detected, show password reset form
        setRequiresPasswordReset(true);
        setOfficerData({ id: user.id, serviceNumber: user.serviceNumber });
        setIsLoading(false);
        return;
      }

      if (!token) {
        throw new Error('No token received from server');
      }

      // TODO: Store token and navigate to officer dashboard
      console.log('Officer login successful, token received');

      // For now, just show success message
      Alert.alert(
        'Login Successful',
        'Welcome to the Officer Portal!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );

    } catch (error) {
      console.error('Officer login error:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Login failed';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setErrors({ passwordReset: 'Please fill in all password fields' });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ passwordReset: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ passwordReset: 'Passwords do not match' });
      return;
    }

    if (!officerData) {
      setErrors({ passwordReset: 'Officer data not available' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Changing password for officer:', officerData.id);

      const response = await axios.post(`${ENV.AUTH_API_URL}/fire/personnel/${officerData.id}/change-password`, {
        newPassword: newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Password change response:', response.status, response.data);

      const { token, user } = response.data;

      if (!token) {
        throw new Error('No token received after password change');
      }

      // TODO: Store token and navigate to officer dashboard
      console.log('Password changed successfully, token received');

      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully. Welcome to the Officer Portal!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );

    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Password change failed';
      setErrors({ passwordReset: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresPasswordReset(false);
    setOfficerData(null);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
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
            <Text style={styles.welcomeTitle}>Officer Portal</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access personnel management tools
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
              {/* Service Number Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'serviceNumber' && styles.inputWrapperFocused,
                  errors.serviceNumber && styles.inputWrapperError
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={focusedField === 'serviceNumber' ? Colors.primary : Colors.textSecondary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your service number"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.serviceNumber}
                    onChangeText={(value) => handleInputChange('serviceNumber', value)}
                    onFocus={() => handleFocus('serviceNumber')}
                    onBlur={() => handleBlur('serviceNumber')}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                {errors.serviceNumber && (
                  <Text style={styles.errorText}>{errors.serviceNumber}</Text>
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
                    placeholder="Enter your password"
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
                
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleOfficerLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In as Officer'}
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color="#FFFFFF" 
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>

              {/* Back to Regular Login */}
              <TouchableOpacity 
                style={styles.backToLoginContainer}
                onPress={() => router.back()}
              >
                <Text style={styles.backToLoginText}>Back to Regular Login</Text>
              </TouchableOpacity>
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
    height: height * 0.45,
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
    marginBottom: 24,
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backToLoginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
