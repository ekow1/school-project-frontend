import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface AuthLinkProps {
    text: string;
    linkText: string;
    onPress: () => void;
    style?: ViewStyle;
}

export const AuthLink: React.FC<AuthLinkProps> = ({
    text,
    linkText,
    onPress,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.text}>{text}</Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.link}>{linkText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    link: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
});

export default AuthLink;
