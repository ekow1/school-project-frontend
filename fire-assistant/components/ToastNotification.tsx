import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export interface ToastData {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'incident' | 'turnout';
    title: string;
    message: string;
    duration?: number;
}

interface ToastNotificationProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: 'checkmark-circle',
        color: Colors.success,
        bgColor: Colors.successAlpha,
    },
    error: {
        icon: 'close-circle',
        color: Colors.danger,
        bgColor: Colors.danger + '20',
    },
    warning: {
        icon: 'warning',
        color: Colors.warning,
        bgColor: Colors.warningAlpha,
    },
    info: {
        icon: 'information-circle',
        color: Colors.accent,
        bgColor: Colors.accentAlpha,
    },
    incident: {
        icon: 'flame',
        color: Colors.primary,
        bgColor: Colors.primaryAlpha,
    },
    turnout: {
        icon: 'clipboard',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
    },
};

export function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
    return (
        <View style={styles.container}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </View>
    );
}

interface ToastItemProps {
    toast: ToastData;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-100));

    const config = toastConfig[toast.type] || toastConfig.info;

    useEffect(() => {
        // Slide in and fade in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto remove after duration
        const duration = toast.duration || 4000;
        const timer = setTimeout(() => {
            handleRemove();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onRemove(toast.id);
        });
    };

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: config.bgColor,
                    borderLeftColor: config.color,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={config.icon as any} size={22} color={config.color} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: config.color }]}>{toast.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>
                        {toast.message}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={handleRemove} style={styles.closeButton}>
                <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    toastContainer: {
        width: '100%',
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        borderLeftWidth: 6,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 0,
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    message: {
        fontSize: 12,
        color: '#1A1A1A',
        lineHeight: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

// Toast context for managing toasts globally
import { createContext, ReactNode, useCallback, useContext } from 'react';

interface ToastContextType {
    showToast: (type: ToastData['type'], title: string, message: string, duration?: number) => void;
    showIncidentToast: (title: string, message: string) => void;
    showTurnoutToast: (title: string, message: string) => void;
    showLoginToast: (officerName: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (type: ToastData['type'], title: string, message: string, duration?: number) => {
            const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newToast: ToastData = {
                id,
                type,
                title,
                message,
                duration,
            };
            setToasts((prev) => [...prev, newToast]);
        },
        []
    );

    const showIncidentToast = useCallback((title: string, message: string) => {
        showToast('incident', title, message, 5000);
    }, [showToast]);

    const showTurnoutToast = useCallback((title: string, message: string) => {
        showToast('turnout', title, message, 5000);
    }, [showToast]);

    const showLoginToast = useCallback((officerName: string) => {
        showToast('info', 'Welcome Back!', `${officerName} has logged in successfully.`);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showIncidentToast, showTurnoutToast, showLoginToast }}>
            {children}
            <ToastNotification toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}
