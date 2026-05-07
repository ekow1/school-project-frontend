import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  buttonText?: string;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  onCancel,
  buttonText = 'OK',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: Colors.success,
          icon: 'checkmark-circle' as const,
          backgroundColor: '#ECFDF5',
        };
      case 'error':
        return {
          color: Colors.danger,
          icon: 'close-circle' as const,
          backgroundColor: '#FEF2F2',
        };
      case 'warning':
        return {
          color: Colors.warning,
          icon: 'warning' as const,
          backgroundColor: '#FFFBEB',
        };
      case 'info':
        return {
          color: Colors.info,
          icon: 'information-circle' as const,
          backgroundColor: '#EFF6FF',
        };
      case 'confirm':
        return {
          color: Colors.warning,
          icon: 'help-circle' as const,
          backgroundColor: '#FFFBEB',
        };
      default:
        return {
          color: Colors.info,
          icon: 'information-circle' as const,
          backgroundColor: '#EFF6FF',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.content, { backgroundColor: config.backgroundColor }]}>
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon} size={48} color={config.color} />
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            {type === 'confirm' ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: config.color }]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: config.color }]}
                onPress={onConfirm || onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
  },
  content: {
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
  },
});

export default CustomAlert;