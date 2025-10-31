import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../components/CustomAlert';

export default function ResetScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  
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

  const handleSendCode = () => {
    if (!phone.trim()) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Phone Required',
        message: 'Please enter your phone number to continue.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    
    if (phone.length !== 9) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Invalid Phone Number',
        message: 'Please enter a valid 9-digit phone number.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    
    router.push(`/verify?from=reset&phone=${phone}`);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your phone number to receive a verification code</Text>

            {/* Phone Input */}
            <View style={[
              styles.phoneInputContainer,
              phoneFocused && styles.inputFocused,
              phone.length > 0 && styles.inputFilled
            ]}>
              <View style={styles.phonePrefixContainer}>
                <Text style={styles.ghanaFlag}>🇬🇭</Text>
                <Text style={styles.phonePrefix}>+233</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="241234567"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                keyboardType="phone-pad"
                accessibilityLabel="Phone Number"
                maxLength={9}
              />
              {phone.length === 9 && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.validIcon} />
              )}
            </View>

            {/* Send Code Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSendCode}
              disabled={phone.length !== 9}
            >
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    height: 58,
    width: '100%',
    marginBottom: 40,
  },
  inputFocused: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inputFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  validIcon: {
    marginRight: 12,
  },
  phonePrefixContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
  },
  ghanaFlag: {
    fontSize: 22,
    marginRight: 8,
  },
  phonePrefix: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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