/**
 * Validation utilities for Fire Assistant App
 */

/**
 * Format Ghana phone number to international format
 */
export const formatPhoneNumber = (phone: string): string => {
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

/**
 * Validate Ghana phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  return /^\+233[0-9]{9}$/.test(formatted);
};

/**
 * Validate password requirements
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * Validate name
 */
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Full name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return null;
};

/**
 * Calculate password strength (0-5)
 */
export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/(?=.*[a-z])/.test(password)) strength++;
  if (/(?=.*[A-Z])/.test(password)) strength++;
  if (/(?=.*\d)/.test(password)) strength++;
  if (/(?=.*[@$!%*?&])/.test(password)) strength++;
  return strength;
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  if (strength <= 2) return 'Weak';
  if (strength <= 3) return 'Fair';
  return 'Strong';
};
