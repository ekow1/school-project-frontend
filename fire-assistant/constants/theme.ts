/**
 * Centralized theme constants for Fire Assistant App
 * Used across all screens and components for consistency
 */

export const Colors = {
    primary: "#C41230",
    primaryLight: "#E85B4A",
    primaryDark: "#8B0D21",
    secondary: "#1A1A1A",
    tertiary: "#78716C",
    background: "#FFF8EF",
    surface: "#FFFFFF",
    surfaceVariant: "#F5EDE3",
    border: "#D4C4B5",
    success: "#10B981",
    warning: "#E8A020",
    danger: "#EF4444",
    accent: "#7C2D12",
    yellow: "#E8A020",
    brown: "#7C2D12",
    text: "#1A1A1A",
    textSecondary: "#78716C",
    shadow: "rgba(0, 0, 0, 0.1)",
    // Alpha variants
    primaryAlpha: "rgba(196, 18, 48, 0.1)",
    successAlpha: "rgba(16, 185, 129, 0.1)",
    warningAlpha: "rgba(232, 160, 32, 0.1)",
    accentAlpha: "rgba(124, 45, 18, 0.1)",
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
};

export const FontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
};

// Gradient colors for auth screens - using const assertion for tuple type
export const AuthGradients = {
    primary: [Colors.primary, Colors.primaryLight] as const,
    dark: [Colors.primaryDark, Colors.primary] as const,
};

// Password strength colors
export const PasswordStrengthColors = {
    weak: Colors.danger,
    fair: Colors.warning,
    strong: Colors.success,
};

// Status colors for incidents
export const StatusColors = {
    pending: { bg: Colors.warningAlpha, text: Colors.warning, border: Colors.warning + "30" },
    'in-progress': { bg: Colors.accentAlpha, text: Colors.accent, border: Colors.accent + "30" },
    handled: { bg: Colors.accentAlpha, text: Colors.accent, border: Colors.accent + "30" },
    resolved: { bg: Colors.successAlpha, text: Colors.success, border: Colors.success + "30" },
    cancelled: { bg: Colors.tertiary + "20", text: Colors.tertiary, border: Colors.tertiary + "30" },
};

export const getStatusColors = (status: string) => {
    return StatusColors[status as keyof typeof StatusColors] || {
        bg: Colors.tertiary + "20",
        text: Colors.tertiary,
        border: Colors.tertiary + "30"
    };
};

export default {
    Colors,
    Spacing,
    BorderRadius,
    FontSizes,
    AuthGradients,
    PasswordStrengthColors,
    StatusColors,
    getStatusColors,
};
