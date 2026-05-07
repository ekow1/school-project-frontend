import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

const C = { primary: '#C41230', border: '#1A1A1A', surface: '#FFFFFF', danger: '#EF4444', muted: '#78716C' };

interface FormButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
}

export const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  variant = 'primary',
  style,
}) => {
  const isDisabled = disabled || isLoading;
  const bg =
    isDisabled ? C.muted :
    variant === 'danger' ? C.danger :
    variant === 'outline' ? C.surface :
    variant === 'secondary' ? '#F5EDE3' :
    C.primary;

  const textColor =
    variant === 'outline' ? C.primary :
    variant === 'secondary' ? C.primary :
    '#fff';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon as any} size={20} color={textColor} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon as any} size={20} color={textColor} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: C.border,
    shadowColor: C.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
    borderColor: C.muted,
  },
  text: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});

export default FormButton;
