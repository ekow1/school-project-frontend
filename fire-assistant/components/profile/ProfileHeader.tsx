import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors } from '../../constants/theme';

interface ProfileHeaderProps {
    name: string;
    imageUrl: string;
    isEditing: boolean;
    onEditPress: () => void;
    onCancelPress?: () => void;
    onImagePress?: () => void;
    onImageError?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    imageUrl,
    isEditing,
    onEditPress,
    onCancelPress,
    onImagePress,
    onImageError,
}) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>MY PROFILE</Text>
                    <Text style={styles.headerSubtitle}>Manage your account</Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity onPress={onEditPress} style={styles.editHeaderButton}>
                        <Ionicons name="create" size={16} color="#1A1A1A" />
                        <Text style={styles.editHeaderText}>EDIT</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={onCancelPress} style={styles.cancelHeaderButton}>
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                        <Text style={styles.cancelHeaderText}>CANCEL</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
                <View style={styles.imageWrapper}>
                    <View style={styles.imageShadowBox}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.profileImage}
                            onError={onImageError}
                        />
                    </View>
                    {isEditing && (
                        <TouchableOpacity style={styles.cameraButton} onPress={onImagePress}>
                            <Ionicons name="camera" size={18} color="#1A1A1A" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.profileName}>{name?.toUpperCase() || 'USER NAME'}</Text>
                <View style={styles.profileBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#1A1A1A" />
                    <Text style={styles.profileBadgeText}>VERIFIED</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Colors.primary,
        borderBottomWidth: 3,
        borderColor: '#1A1A1A',
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700',
        marginTop: 2,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    editHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        borderRadius: 0,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    editHeaderText: {
        color: '#1A1A1A',
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    cancelHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.danger,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        borderRadius: 0,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    cancelHeaderText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    profileSection: {
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    imageShadowBox: {
        backgroundColor: '#1A1A1A',
        padding: 0,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 0,
        borderWidth: 3,
        borderColor: '#1A1A1A',
    },
    cameraButton: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        width: 34,
        height: 34,
        borderRadius: 0,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A1A1A',
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        borderRadius: 0,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    profileBadgeText: {
        color: '#1A1A1A',
        fontSize: 11,
        fontWeight: '900',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
});

export default ProfileHeader;
