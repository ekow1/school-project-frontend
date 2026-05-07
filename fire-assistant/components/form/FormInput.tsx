import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

const C = { primary: '#C41230', border: '#1A1A1A', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', text: '#1A1A1A' };

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  placeholder: string;
  error?: string;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  error,
  focused = false,
  onFocus,
  onBlur,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  editable = true,
  style,
}) => {
  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View
        style={[
          styles.wrapper,
          focused && styles.wrapperFocused,
          error && styles.wrapperError,
        ]}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={18} color={focused ? C.primary : C.muted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 18 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.border,
  },
  wrapperFocused: {
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  wrapperError: {
    borderColor: C.danger,
    shadowColor: C.danger,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  iconBox: { paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 15, color: C.text, fontWeight: '600' },
  error: { fontSize: 11, color: C.danger, marginTop: 5, fontWeight: '700' },
});

export default FormInput;
