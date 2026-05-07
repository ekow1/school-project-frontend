import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import PasswordStrength from '../auth/PasswordStrength';

const C = { primary: '#C41230', border: '#1A1A1A', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', text: '#1A1A1A' };

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  showStrength?: boolean;
  maxStrength?: number;
  style?: ViewStyle;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  focused = false,
  onFocus,
  onBlur,
  showStrength = true,
  maxStrength = 5,
  style,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={[styles.wrapper, focused && styles.wrapperFocused, error && styles.wrapperError]}>
        <View style={styles.iconBox}>
          <Ionicons name="lock-closed-outline" size={18} color={focused ? C.primary : C.muted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={C.muted} />
        </TouchableOpacity>
      </View>

      {showStrength && value.length > 0 && (
        <PasswordStrength
          strength={
            (value.length >= 8 ? 1 : 0)
            + (/(?=.*[a-z])/.test(value) ? 1 : 0)
            + (/(?=.*[A-Z])/.test(value) ? 1 : 0)
            + (/(?=.*\d)/.test(value) ? 1 : 0)
            + (/(?=.*[@$!%*?&])/.test(value) ? 1 : 0)
          }
          password={value}
          maxStrength={maxStrength}
        />
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: 1.2 },
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 2, borderColor: C.border,
  },
  wrapperFocused: {
    borderColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  wrapperError: {
    borderColor: C.danger,
    shadowColor: C.danger, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  iconBox: { paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.text, fontWeight: '600' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  error: { fontSize: 11, color: C.danger, marginTop: 5, fontWeight: '700' },
});

export default PasswordInput;
