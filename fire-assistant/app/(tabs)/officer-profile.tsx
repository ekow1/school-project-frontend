"use client"

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"
import CustomAlert from "../../components/CustomAlert"
import { useAuthStore } from "../../store/authStore"

const Colors = {
    primary: "#C41230",
    primaryLight: "#E85B4A",
    primaryDark: "#8B0D21",
    secondary: "#1A1A1A",
    tertiary: "#78716C",
    background: "#FFF8EF",
    surface: "#FFFFFF",
    border: "#D4C4B5",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#E8A020",
    accent: "#7C2D12",
    inputBg: "#FFF8EF",
    primaryAlpha: "rgba(196, 18, 48, 0.1)",
}

interface OfficerProfileData {
    _id?: string
    id?: string
    name: string
    phone: string
    email?: string
    serviceNumber: string
    rank?: string
    station?: string
    unit?: string
    department?: string
    image?: string
    status?: string
}

export default function OfficerProfileScreen() {
    const router = useRouter()
    const { logout, getProfile, updateProfile, user, isLoading } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<OfficerProfileData>({
        name: "",
        phone: "",
        email: "",
        serviceNumber: "",
        rank: "",
        station: "",
        unit: "",
        department: "",
        image: "",
        status: "active",
    })
    const [tempData, setTempData] = useState({ ...profileData })
    const [imageError, setImageError] = useState(false)

    // Alert states
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning' | 'confirm';
        title: string;
        message: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
    }>({
        visible: false,
        type: 'success',
        title: '',
        message: '',
    })

    const getFallbackImage = (name: string = "Officer") => {
        const encodedName = encodeURIComponent(name)
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=C41230&color=fff&size=200&bold=true`
        return fallbackUrl
    }

    // Compute the profile image URL
    const profileImageUrl = useMemo(() => {
        const fallback = getFallbackImage(profileData.name || 'Officer')
        if (imageError) {
            return fallback
        }
        if (profileData.image) {
            return profileData.image
        }
        return fallback
    }, [profileData.name, profileData.image, imageError])

    // Sync with store user data
    useEffect(() => {
        if (user) {
            console.log('Syncing officer user from store:', user)
            const syncedData = {
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                serviceNumber: user.serviceNumber || "",
                rank: user.rank || "",
                station: user.station || "",
                unit: user.unit || "",
                department: user.department || "",
                image: user.image || "",
                status: user.status || "active",
            }
            setProfileData(syncedData)
            setTempData(syncedData)
            setImageError(false)
        }
    }, [user])

    // Reset imageError when profileData.image changes
    useEffect(() => {
        if (profileData.image) {
            setImageError(false)
        }
    }, [profileData.image])

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            console.log('Fetching officer profile...')
            const data = await getProfile()

            if (data) {
                console.log('Officer profile fetched:', data)
                const syncedData = {
                    name: data.name || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    serviceNumber: data.serviceNumber || "",
                    rank: data.rank || "",
                    station: data.station || "",
                    unit: data.unit || "",
                    department: data.department || "",
                    image: data.image || "",
                    status: data.status || "active",
                }
                setProfileData(syncedData)
                setTempData(syncedData)
                setImageError(false)
            }
        } catch (error) {
            console.error('Failed to fetch officer profile:', error)
        } finally {
            setLoading(false)
        }
    }

    console.log('user,', getProfile)

    const handleSave = async () => {
        try {
            console.log('Saving officer profile data:', tempData)

            // Filter out empty strings to only send fields with values
            const filteredData: Partial<OfficerProfileData> = {}
            Object.keys(tempData).forEach((key) => {
                const value = tempData[key as keyof OfficerProfileData]
                if (value && value.trim() !== '') {
                    filteredData[key as keyof OfficerProfileData] = value
                }
            })

            console.log('Filtered profile data:', filteredData)

            await updateProfile(filteredData as any)
            console.log('Officer profile updated')
            setIsEditing(false)

            setAlertConfig({
                visible: true,
                type: 'success',
                title: 'Profile Updated!',
                message: 'Your officer profile has been updated successfully.',
                confirmText: 'OK',
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
            })
        } catch (error) {
            console.error('Save error:', error)
            setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update profile. Please try again.',
                confirmText: 'Try Again',
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
            })
        }
    }

    const handleCancel = () => {
        setTempData(profileData)
        setIsEditing(false)
    }

    const handleLogout = () => {
        setAlertConfig({
            visible: true,
            type: 'confirm',
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            onConfirm: async () => {
                setAlertConfig(prev => ({ ...prev, visible: false }))
                await logout()
                router.replace('/login')
            },
            onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        })
    }

    const updateField = (field: keyof OfficerProfileData, value: string) => {
        setTempData((prev) => ({ ...prev, [field]: value }))
    }

    const getStatusColor = (status?: string) => {
        const normalizedStatus = status?.toLowerCase() || 'active'
        switch (normalizedStatus) {
            case 'active':
                return Colors.success
            case 'on-duty':
                return Colors.primary
            case 'off-duty':
                return Colors.tertiary
            case 'on-leave':
                return Colors.warning
            default:
                return Colors.tertiary
        }
    }

    const getShiftLabel = (shift: string) => {
        switch (shift.toLowerCase()) {
            case 'day':
                return 'Day Shift'
            case 'night':
                return 'Night Shift'
            case 'rotating':
                return 'Rotating Shift'
            default:
                return shift
        }
    }

    const getRankLabel = (rank?: string) => {
        const normalizedRank = rank?.toLowerCase() || ''
        switch (normalizedRank) {
            case 'firefighter':
                return 'Firefighter'
            case 'senior-firefighter':
                return 'Senior Firefighter'
            case 'fire-engineer':
                return 'Fire Engineer'
            case 'lieutenant':
                return 'Lieutenant'
            case 'captain':
                return 'Captain'
            case 'battalion-chief':
                return 'Battalion Chief'
            case 'assistant-chief':
                return 'Assistant Chief'
            case 'fire-chief':
                return 'Fire Chief'
            default:
                return rank || 'Not set'
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading officer profile...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <AnimatedScreen direction="fade" delay={100}>
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.headerBlock}>
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.headerTitle}>Officer Profile</Text>
                                <Text style={styles.headerSubtitle}>Ghana National Fire Service</Text>
                            </View>
                            {!isEditing ? (
                                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editHeaderButton}>
                                    <Ionicons name="create-outline" size={20} color={NB.primary} />
                                    <Text style={styles.editHeaderText}>Edit</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={handleCancel} style={styles.cancelHeaderButton}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                    <Text style={styles.cancelHeaderText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Profile Picture Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: profileImageUrl }}
                                    style={styles.profileImage as ImageStyle}
                                    onError={() => {
                                        setImageError(true)
                                    }}
                                    key={profileImageUrl}
                                />
                                {isEditing && (
                                    <TouchableOpacity style={styles.cameraButton} onPress={() => { }}>
                                        <Ionicons name="camera" size={18} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.profileName}>{profileData.name || 'Officer Name'}</Text>
                            <View style={styles.rankBadge}>
                                <MaterialCommunityIcons name="shield-star" size={16} color="#fff" />
                                <Text style={styles.rankBadgeText}>{getRankLabel(profileData.rank)}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(profileData.status) + '20' }]}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(profileData.status) }]} />
                                <Text style={[styles.statusBadgeText, { color: getStatusColor(profileData.status) }]}>
                                    {profileData.status ? profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1) : 'Active'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        {/* Service Information */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconContainer, { backgroundColor: Colors.primary }]}>
                                    <MaterialCommunityIcons name="badge-account-horizontal" size={18} color="#fff" />
                                </View>
                                <Text style={styles.sectionTitle}>Service Information</Text>
                            </View>

                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="id-card" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Service Number</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.serviceNumber}
                                                onChangeText={(value) => updateField('serviceNumber', value)}
                                                placeholder="Enter service number"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{profileData.serviceNumber || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons name="shield-star-outline" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Rank</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.rank}
                                                onChangeText={(value) => updateField('rank', value)}
                                                placeholder="Enter rank"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{getRankLabel(profileData.rank) || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons name="fire-truck" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Station</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.station}
                                                onChangeText={(value) => updateField('station', value)}
                                                placeholder="Enter station name"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{profileData.station || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons name="account-group" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Unit</Text>
                                        <Text style={styles.infoValue}>{profileData.unit || 'Not set'}</Text>
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons name="office-building" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Department</Text>
                                        <Text style={styles.infoValue}>{profileData.department || 'Not set'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Personal Information */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconContainer}>
                                    <Ionicons name="person" size={18} color="#fff" />
                                </View>
                                <Text style={styles.sectionTitle}>Personal Information</Text>
                            </View>

                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="person-outline" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Full Name</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.name}
                                                onChangeText={(value) => updateField('name', value)}
                                                placeholder="Enter full name"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{profileData.name || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="call-outline" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Phone Number</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.phone}
                                                onChangeText={(value) => updateField('phone', value)}
                                                placeholder="Enter phone number"
                                                keyboardType="phone-pad"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{profileData.phone || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        {isEditing ? (
                                            <TextInput
                                                style={styles.infoInput}
                                                value={tempData.email}
                                                onChangeText={(value) => updateField('email', value)}
                                                placeholder="Enter email"
                                                keyboardType="email-address"
                                            />
                                        ) : (
                                            <Text style={styles.infoValue}>{profileData.email || 'Not set'}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconContainer, { backgroundColor: Colors.accent }]}>
                                    <Ionicons name="flash" size={18} color="#fff" />
                                </View>
                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                            </View>

                            <View style={styles.actionCard}>
                                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/turnout-slip')}>
                                    <View style={[styles.actionIconContainer, { backgroundColor: Colors.primaryAlpha }]}>
                                        <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.actionText}>View Turnout Slips</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
                                </TouchableOpacity>

                                <View style={styles.actionDivider} />

                                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/fire-stations')}>
                                    <View style={[styles.actionIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                                        <MaterialCommunityIcons name="fire-truck" size={20} color={Colors.warning} />
                                    </View>
                                    <Text style={styles.actionText}>Fire Stations</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
                                </TouchableOpacity>

                                <View style={styles.actionDivider} />

                                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/incidents')}>
                                    <View style={[styles.actionIconContainer, { backgroundColor: Colors.danger + '20' }]}>
                                        <Ionicons name="document-text-outline" size={20} color={Colors.danger} />
                                    </View>
                                    <Text style={styles.actionText}>Incident Reports</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            {isEditing && (
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark" size={20} color="#fff" />
                                            <Text style={styles.saveButtonText}>Save Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>

                    {/* Custom Alert */}
                    <CustomAlert
                        visible={alertConfig.visible}
                        type={alertConfig.type}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        confirmText={alertConfig.confirmText}
                        cancelText={alertConfig.cancelText}
                        onConfirm={alertConfig.onConfirm}
                        onCancel={alertConfig.onCancel}
                        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                    />
                </View>
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', accent: '#7C2D12' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: NB.bg },
    container: { flex: 1, backgroundColor: NB.bg },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 16, fontSize: 15, color: NB.muted, fontWeight: '600' },

    headerBlock: {
        backgroundColor: NB.primary,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
        borderBottomWidth: 3, borderBottomColor: NB.border,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
    editHeaderButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderWidth: 2, borderColor: NB.border,
        paddingHorizontal: 12, paddingVertical: 7, gap: 5,
        shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    },
    editHeaderText: { color: NB.primary, fontSize: 13, fontWeight: '800' },
    cancelHeaderButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: NB.border, borderWidth: 2, borderColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 7, gap: 5,
    },
    cancelHeaderText: { color: '#fff', fontSize: 13, fontWeight: '800' },

    profileSection: { alignItems: 'center', marginTop: 20 },
    imageWrapper: { position: 'relative' },
    profileImage: { width: 96, height: 96, borderWidth: 3, borderColor: '#fff' },
    cameraButton: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: NB.border, width: 30, height: 30,
        borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    },
    profileName: { marginTop: 12, fontSize: 20, fontWeight: '800', color: '#fff' },
    rankBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 10, paddingVertical: 5, marginTop: 8, gap: 6,
    },
    rankBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, gap: 5,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    },
    statusDot: { width: 7, height: 7 },
    statusBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

    content: { flex: 1, padding: 16 },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    sectionIconContainer: {
        width: 34, height: 34, backgroundColor: NB.primary,
        borderWidth: 2, borderColor: NB.border, alignItems: 'center', justifyContent: 'center',
        shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: NB.border, textTransform: 'uppercase', letterSpacing: 0.5 },

    infoCard: {
        backgroundColor: NB.surface, borderWidth: 2, borderColor: NB.border, padding: 14,
        ...nbShadow,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoIconContainer: {
        width: 38, height: 38, borderWidth: 2, borderColor: NB.border,
        backgroundColor: NB.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 10, color: NB.muted, marginBottom: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: 14, color: NB.border, fontWeight: '600' },
    infoInput: {
        fontSize: 14, color: NB.border, fontWeight: '600', padding: 0,
        borderBottomWidth: 2, borderBottomColor: NB.primary, paddingVertical: 4,
    },
    infoDivider: { height: 2, backgroundColor: NB.border, marginVertical: 10, opacity: 0.08, marginLeft: 50 },

    actionCard: {
        backgroundColor: NB.surface, borderWidth: 2, borderColor: NB.border,
        ...nbShadow,
    },
    actionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0 },
    actionIconContainer: {
        width: 38, height: 38, borderWidth: 2, borderColor: NB.border,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    actionText: { flex: 1, fontSize: 14, fontWeight: '700', color: NB.border },
    actionDivider: { height: 2, backgroundColor: NB.border, opacity: 0.1, marginLeft: 64 },

    buttonContainer: { gap: 10, marginTop: 8 },
    saveButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: NB.primary, paddingVertical: 15,
        borderWidth: 2, borderColor: NB.border, gap: 8,
        ...nbShadow,
    },
    saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: NB.surface, paddingVertical: 15,
        borderWidth: 2, borderColor: NB.danger, gap: 8,
        shadowColor: NB.danger, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    logoutButtonText: { color: NB.danger, fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    bottomPadding: { height: 40 },
    primaryAlpha: 'rgba(211, 47, 47, 0.1)',
})
