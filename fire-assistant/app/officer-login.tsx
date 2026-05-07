import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
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
import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', warning: '#E8A020' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const Colors = {
  primary: "#C41230",
  primaryLight: "#E85B4A",
  background: "#FFF8EF",
  surface: "#FFFFFF",
  border: "#1A1A1A",
  error: "#EF4444",
  text: "#1A1A1A",
  textSecondary: "#78716C",
  warning: "#E8A020",
};

export default function OfficerLoginScreen() {
  const [formData, setFormData] = useState({
    serviceNumber: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const [officerData, setOfficerData] = useState<{ id: string, serviceNumber: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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
      const response = await axios.post(`${ENV.AUTH_API_URL}/fire/personnel/login`, {
        serviceNumber: formData.serviceNumber,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { token, user, requiresPasswordChange } = response.data;

      if (requiresPasswordChange) {
        setRequiresPasswordReset(true);
        setOfficerData({ id: user.id, serviceNumber: user.serviceNumber });
        setIsLoading(false);
        return;
      }

      if (!token) {
        throw new Error('No token received from server');
      }

      const userData = user ? { ...user, userType: 'fire_officer' as const } : {
        id: '',
        name: '',
        serviceNumber: formData.serviceNumber,
        userType: 'fire_officer' as const
      };

      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));

      useAuthStore.setState({ user: userData, token, isLoading: false, error: null });
      router.replace('/(tabs)/turnout-slip');

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Login failed';
      setErrors({ general: errorMessage });
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
      const response = await axios.post(`${ENV.AUTH_API_URL}/fire/personnel/${officerData.id}/change-password`, {
        newPassword: newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error('No token received after password change');
      }

      const userData = user ? { ...user, userType: 'fire_officer' as const } : {
        id: officerData.id,
        name: '',
        serviceNumber: officerData.serviceNumber,
        userType: 'fire_officer' as const
      };

      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));

      useAuthStore.setState({ user: userData, token, isLoading: false, error: null });
      router.replace('/(tabs)/turnout-slip');

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Password change failed';
      setErrors({ passwordReset: errorMessage });
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
            uri: 'https://images.unsplash.com/photo-1560525483-58a8814ce752?w=1920&q=80'
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.4)', 'rgba(196, 18, 48, 0.3)']}
          style={styles.gradientOverlay}
        />

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
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.logoGradient}
              >
                <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </View>

            <Text style={styles.brandTitle}>FIRE ASSISTANT</Text>
            <Text style={styles.brandSubtitle}>Ghana National Fire Service</Text>

            <View style={styles.officerBadge}>
              <Ionicons name="star" size={14} color={NB.border} />
              <Text style={styles.officerBadgeText}>OFFICER PORTAL</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Card Handle */}
            <View style={styles.cardHandle} />

            <Text style={styles.loginTitle}>Officer Login</Text>
            <Text style={styles.loginSubtitle}>Access personnel management tools</Text>

            {/* Form */}
            <KeyboardAvoidingView
              style={styles.form}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {!requiresPasswordReset ? (
                <>
                  {/* Service Number Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Service Number</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'serviceNumber' && styles.inputWrapperFocused,
                      errors.serviceNumber && styles.inputWrapperError
                    ]}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={focusedField === 'serviceNumber' ? Colors.primary : Colors.textSecondary}
                        />
                      </View>
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
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'password' && styles.inputWrapperFocused,
                      errors.password && styles.inputWrapperError
                    ]}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={focusedField === 'password' ? Colors.primary : Colors.textSecondary}
                        />
                      </View>
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

                  {/* General Error */}
                  {errors.general && (
                    <View style={styles.generalError}>
                      <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                      <Text style={styles.generalErrorText}>{errors.general}</Text>
                    </View>
                  )}

                  {/* Login Button */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleOfficerLogin}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight]}
                      style={styles.loginButtonGradient}
                    >
                      <Text style={styles.loginButtonText}>
                        {isLoading ? 'Signing In...' : 'Sign In as Officer'}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                /* Password Reset Form */
                <View style={styles.passwordResetContainer}>
                  <View style={styles.resetIconContainer}>
                    <LinearGradient
                      colors={[Colors.warning, Colors.primary]}
                      style={styles.resetIconGradient}
                    >
                      <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  </View>

                  <Text style={styles.resetTitle}>Set New Password</Text>
                  <Text style={styles.resetSubtitle}>
                    Your account uses a temporary password. Please create a new password to continue.
                  </Text>

                  {/* New Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        placeholderTextColor={Colors.textSecondary}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        placeholderTextColor={Colors.textSecondary}
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
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {errors.passwordReset && (
                    <Text style={styles.errorText}>{errors.passwordReset}</Text>
                  )}

                  {/* Reset Buttons */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handlePasswordReset}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight]}
                      style={styles.loginButtonGradient}
                    >
                      <Text style={styles.loginButtonText}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackToLogin}
                    disabled={isLoading}
                  >
                    <Ionicons name="arrow-back" size={18} color={Colors.primary} />
                    <Text style={styles.backButtonText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Back to Regular Login */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => router.back()}
              >
                <Ionicons name="log-in-outline" size={18} color={Colors.primary} />
                <Text style={styles.backToLoginText}>Back to Regular Login</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  container: {
    flex: 1,
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
    top: 0,
    left: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: NB.border,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '800',
    textShadowColor: NB.border,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  officerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: NB.border,
    marginTop: 16,
    ...nbShadow,
  },
  officerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: NB.border,
    marginLeft: 6,
    letterSpacing: 1,
  },
  loginCard: {
    width: '100%',
    backgroundColor: NB.surface,
    borderWidth: 3,
    borderColor: NB.border,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    ...nbShadow,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: NB.border,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginSubtitle: {
    fontSize: 13,
    color: NB.muted,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: NB.border,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.bg,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: NB.primary,
    backgroundColor: NB.surface,
    ...nbShadow,
  },
  inputWrapperError: {
    borderColor: Colors.danger,
    backgroundColor: 'Colors.warningAlpha',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'Colors.warningAlpha',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    fontSize: 14,
    color: Colors.danger,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: NB.border,
    ...nbShadow,
    backgroundColor: NB.primary,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: NB.primary,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passwordResetContainer: {
    alignItems: 'center',
  },
  resetIconContainer: {
    marginBottom: 16,
  },
  resetIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  resetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 16,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
});
