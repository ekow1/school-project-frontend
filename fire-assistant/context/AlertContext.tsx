import React, { createContext, ReactNode, useContext, useState } from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info', onClose?: () => void) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string, onClose?: () => void) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onClose?: () => void
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onClose,
    });
  };

  const showError = (message: string, title: string = 'Error') => {
    showAlert(title, message, 'error');
  };

  const showSuccess = (message: string, title: string = 'Success', onClose?: () => void) => {
    showAlert(title, message, 'success', onClose);
  };

  const showWarning = (message: string, title: string = 'Warning') => {
    showAlert(title, message, 'warning');
  };

  const showInfo = (message: string, title: string = 'Info') => {
    showAlert(title, message, 'info');
  };

  const handleClose = () => {
    const onClose = alert.onClose;
    setAlert(prev => ({ ...prev, visible: false }));
    if (onClose) {
      onClose();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showError, showSuccess, showWarning, showInfo }}>
      {children}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={handleClose}
        onConfirm={handleClose}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

