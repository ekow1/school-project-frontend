import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors } from '../../constants/theme';

interface ProfileSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    style?: ViewStyle;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    title,
    icon,
    children,
    style,
}) => {
    return (
        <View style={[styles.section, style]}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                    <Ionicons name={icon as any} size={18} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
};

interface ProfileFieldProps {
    label: string;
    value: string;
    isEditing: boolean;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    icon?: string;
    verified?: boolean;
    editable?: boolean;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
    label,
    value,
    isEditing,
    onChangeText,
    placeholder,
    icon,
    verified = false,
    editable = true,
}) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {isEditing && editable ? (
                <View style={styles.inputContainer}>
                    {icon && (
                        <Ionicons name={icon as any} size={18} color={Colors.tertiary} style={styles.inputIcon} />
                    )}
                    <View style={styles.textInputContainer}>
                        {/* Simple inline input - could be enhanced with TextInput */}
                        <Text style={styles.editableText}>
                            {value || placeholder || `Enter ${label.toLowerCase()}`}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.displayValue}>
                    {icon && (
                        <Ionicons name={icon as any} size={18} color={Colors.primary} />
                    )}
                    <Text style={styles.displayText}>{value || 'Not set'}</Text>
                    {verified && value && (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.verifiedIcon} />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 0,
        borderWidth: 2.5,
        borderColor: '#1A1A1A',
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 2,
        borderBottomColor: '#1A1A1A',
    },
    sectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 0,
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldGroup: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1.5,
        borderBottomColor: '#1A1A1A',
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    displayValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    displayText: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '600',
        flex: 1,
        marginLeft: 10,
    },
    verifiedIcon: {
        marginLeft: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
        borderRadius: 0,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInputContainer: {
        flex: 1,
    },
    editableText: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '600',
    },
});

export default ProfileSection;
