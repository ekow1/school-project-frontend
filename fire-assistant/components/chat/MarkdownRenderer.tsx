import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../../constants/theme';

// Markdown Styles for react-native-markdown-display
export const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.secondary,
    },
    heading1: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.secondary,
        marginTop: 12,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.secondary,
        marginTop: 10,
        marginBottom: 6,
    },
    heading3: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondary,
        marginTop: 8,
        marginBottom: 4,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.secondary,
        marginBottom: 8,
    },
    strong: {
        fontWeight: '700',
        color: Colors.secondary,
    },
    em: {
        fontStyle: 'italic',
        color: Colors.secondary,
    },
    link: {
        color: Colors.primary,
    },
    blockquote: {
        backgroundColor: Colors.surface,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        paddingLeft: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    code: {
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        color: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 13,
    },
    code_block: {
        backgroundColor: '#1A1A1A',
        color: 'Colors.surface',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        fontSize: 13,
    },
    bullet_list: {
        marginBottom: 8,
        paddingLeft: 20,
    },
    ordered_list: {
        marginBottom: 8,
        paddingLeft: 20,
    },
    list_item: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.secondary,
        marginBottom: 4,
    },
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginVertical: 12,
    },
    table: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
    },
    th: {
        backgroundColor: Colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontWeight: '700',
        fontSize: 13,
        color: Colors.secondary,
    },
    td: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 13,
        color: Colors.secondary,
    },
});

// History Markdown Styles - Lighter style for chat history previews
export const historyMarkdownStyles = StyleSheet.create({
    body: {
        fontSize: 13,
        lineHeight: 18,
        color: Colors.tertiary,
    },
    heading1: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.secondary,
        marginTop: 4,
        marginBottom: 2,
    },
    heading2: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondary,
        marginTop: 4,
        marginBottom: 2,
    },
    heading3: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.secondary,
        marginTop: 4,
        marginBottom: 2,
    },
    paragraph: {
        fontSize: 13,
        lineHeight: 18,
        color: Colors.tertiary,
        marginBottom: 4,
    },
    strong: {
        fontWeight: '600',
        color: Colors.secondary,
    },
    em: {
        fontStyle: 'italic',
        color: Colors.tertiary,
    },
    link: {
        color: Colors.primary,
    },
    blockquote: {
        backgroundColor: Colors.surface,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
        paddingLeft: 8,
        paddingVertical: 4,
        marginBottom: 4,
    },
    code: {
        backgroundColor: Colors.surface,
        color: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 11,
    },
    fence: {
        backgroundColor: '#1A1A1A',
        color: 'Colors.surface',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    code_block: {
        backgroundColor: '#1A1A1A',
        color: 'Colors.surface',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    bullet_list: {
        marginBottom: 4,
        paddingLeft: 16,
    },
    ordered_list: {
        marginBottom: 4,
        paddingLeft: 16,
    },
    list_item: {
        fontSize: 13,
        lineHeight: 18,
        color: Colors.tertiary,
        marginBottom: 2,
    },
    image: {
        marginVertical: 4,
        borderRadius: 6,
    },
});

// Normalize markdown - fix common issues before rendering
export const normalizeMarkdown = (md: string): string => {
    if (!md) return "";
    return md
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/---/g, "\n\n---\n\n")
        .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
        .trim();
};

// Helper function to clean markdown for history preview
export const cleanMarkdownForHistory = (text: string): string => {
    if (!text) return '';
    // Remove excessive whitespace and newlines
    let cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
    // Limit to reasonable length for preview
    const words = cleaned.split(/\s+/);
    if (words.length > 20) {
        cleaned = words.slice(0, 20).join(' ') + '...';
    }
    return cleaned;
};

interface MarkdownRendererProps {
    text: string;
    style?: any;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, style }) => {
    if (!text) {
        return <Text style={style}>No content</Text>;
    }

    // Normalize markdown before rendering to fix common issues
    const normalizedText = normalizeMarkdown(text);

    return (
        <Markdown
            style={markdownStyles}
            children={normalizedText}
        />
    );
};

// History Markdown Renderer - Lighter style for chat history previews
interface HistoryMarkdownRendererProps {
    text: string;
    style?: any;
}

export const HistoryMarkdownRenderer: React.FC<HistoryMarkdownRendererProps> = ({ text, style }) => {
    if (!text) return null;

    const cleanedText = cleanMarkdownForHistory(text);

    return (
        <Markdown
            style={historyMarkdownStyles}
            children={cleanedText}
        />
    );
};

export default MarkdownRenderer;
