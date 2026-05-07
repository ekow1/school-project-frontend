import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TypewriterMarkdownProps {
    text: string;
    style?: any;
    speed?: number;
    onComplete?: () => void;
}

export const TypewriterMarkdown: React.FC<TypewriterMarkdownProps> = ({
    text,
    style,
    speed = 8,
    onComplete
}) => {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Reset when text changes
    useEffect(() => {
        setDisplayText("");
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]);

    useEffect(() => {
        if (isComplete || !text) return;

        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                // Show chunks of 4 characters at once for streaming effect
                const chunkSize = Math.min(4, text.length - currentIndex);
                setDisplayText(text.substring(0, currentIndex + chunkSize));
                setCurrentIndex(currentIndex + chunkSize);
            }, speed);

            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
            onComplete?.();
        }
    }, [currentIndex, text, speed, isComplete, onComplete]);

    if (!displayText) {
        return null;
    }

    return (
        <View style={style}>
            {/* ✅ While typing: show plain text (prevents broken markdown parsing) */}
            {!isComplete ? (
                <Text style={{ fontSize: 15, lineHeight: 22, color: Colors.secondary }}>
                    {displayText}
                    <Text style={{ opacity: 0.5 }}>|</Text>
                </Text>
            ) : (
                /* ✅ When complete: render markdown */
                <MarkdownRenderer text={displayText} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({});

export default TypewriterMarkdown;
