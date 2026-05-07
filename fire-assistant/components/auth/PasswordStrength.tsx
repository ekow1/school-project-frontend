import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, PasswordStrengthColors } from '../../constants/theme';

interface PasswordStrengthProps {
    strength: number; // 0-5
    password: string;
    maxStrength?: number;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
    strength,
    password,
    maxStrength = 5,
}) => {
    if (password.length === 0) {
        return null;
    }

    const getStrengthLabel = () => {
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Fair';
        return 'Strong';
    };

    const getStrengthColor = () => {
        if (strength <= 2) return PasswordStrengthColors.weak;
        if (strength <= 3) return PasswordStrengthColors.fair;
        return PasswordStrengthColors.strong;
    };

    return (
        <View style={styles.container}>
            <View style={styles.strengthBar}>
                {Array.from({ length: maxStrength }, (_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.strengthSegment,
                            {
                                backgroundColor: index < strength
                                    ? getStrengthColor()
                                    : Colors.border
                            }
                        ]}
                    />
                ))}
            </View>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                {getStrengthLabel()}
            </Text>
        </View>
    );
};

// Utility function to calculate password strength
export const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    strengthBar: {
        flex: 1,
        flexDirection: 'row',
        gap: 4,
        marginRight: 12,
    },
    strengthSegment: {
        flex: 1,
        height: 4,
        borderRadius: 0,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 50,
    },
});

export default PasswordStrength;
