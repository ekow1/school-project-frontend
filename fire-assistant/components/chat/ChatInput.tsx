import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors } from '../../constants/theme';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isLoading?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChangeText,
    onSend,
    isLoading = false,
    placeholder = 'Ask me anything about fire safety...',
}) => {
    const canSend = value.trim().length > 0 && !isLoading;

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.tertiary}
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    maxLength={2000}
                />
            </View>

            <TouchableOpacity
                style={[styles.sendButton, canSend && styles.sendButtonActive]}
                onPress={onSend}
                disabled={!canSend}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Ionicons
                        name="send"
                        size={20}
                        color={canSend ? '#FFFFFF' : Colors.tertiary}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.surface,
        borderTopWidth: 3,
        borderTopColor: Colors.secondary,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 2,
        borderColor: Colors.secondary,
        borderRadius: 0,
        paddingHorizontal: 12,
        paddingVertical: 10,
        maxHeight: 120,
        marginRight: 10,
    },
    input: {
        fontSize: 15,
        color: Colors.secondary,
        lineHeight: 20,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderWidth: 2,
        borderColor: Colors.secondary,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
});

export default ChatInput;
