"use client"

import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"
import CustomAlert from "../../components/CustomAlert"
import { useAuthStore } from "../../store/authStore"
import { uploadImageToCloudinary } from "../../utils/cloudinary"

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
  inputBg: "#FFF8EF",
}

interface ProfileData {
  _id?: string
  name: string
  phone: string
  email: string
  address: string
  country: string
  dob: string
  image: string
  ghanaPost: string
  serviceNumber?: string
}

export default function ProfileScreen() {
  const router = useRouter()
  const { logout, getProfile, updateProfile, deleteProfile, isLoading, user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    country: "Ghana",
    dob: "",
    image: "",
    ghanaPost: "",
    serviceNumber: "",
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

  const getFallbackImage = (name: string = "User") => {
    const encodedName = encodeURIComponent(name)
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=C41230&color=fff&size=200&bold=true`
    console.log('Generating fallback image for:', name, '→', fallbackUrl)
    return fallbackUrl
  }

  // Compute the profile image URL
  const profileImageUrl = useMemo(() => {
    const fallback = getFallbackImage(profileData.name || 'User')
    if (imageError) {
      console.log('Using fallback (error):', fallback)
      return fallback
    }
    if (profileData.image) {
      console.log('Using profile image:', profileData.image)
      return profileData.image
    }
    console.log('Using fallback (no image):', fallback)
    return fallback
  }, [profileData.name, profileData.image, imageError])

  // Sync with store user data
  useEffect(() => {
    if (user) {
      console.log('Syncing user from store:', user)
      const syncedData = {
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        country: user.country || "Ghana",
        dob: user.dob || "",
        image: user.image || "",
        ghanaPost: user.ghanaPost || "",
        serviceNumber: user.serviceNumber || "",
      }
      setProfileData(syncedData)
      setTempData(syncedData)
      setImageError(false) // Reset image error when data changes
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
      const data = await getProfile()
      
      if (data) {
        console.log('Fetched profile data:', data)
        // Manually set state to ensure immediate update
        const syncedData = {
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          country: data.country || "Ghana",
          dob: data.dob || "",
          image: data.image || "",
          ghanaPost: data.ghanaPost || "",
          serviceNumber: data.serviceNumber || (data as any)?.service_number || "",
        }
        setProfileData(syncedData)
        setTempData(syncedData)
        setImageError(false) // Reset image error on new data
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('Saving profile data:', tempData)
      
      // Filter out empty strings to only send fields with values
      const filteredData: Partial<ProfileData> = {}
      Object.keys(tempData).forEach((key) => {
        const value = tempData[key as keyof ProfileData]
        // Only include non-empty strings
        if (value && value.trim() !== '') {
          filteredData[key as keyof ProfileData] = value
        }
      })
      
      console.log('Filtered profile data (sending only non-empty fields):', filteredData)
      
      const updatedUser = await updateProfile(filteredData)
      console.log('Profile updated, received:', updatedUser)
      setIsEditing(false)
      
      // Show success alert and refetch data when user clicks OK
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Success!',
        message: 'Your profile has been updated successfully.',
        buttonText: 'Got it',
        onConfirm: async () => {
          setAlertConfig(prev => ({ ...prev, visible: false }))
          await fetchProfile()
        },
      })
    } catch (error) {
      console.error('Save error:', error)
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        buttonText: 'Try Again',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      })
    }
  }

  const handleCancel = () => {
    setTempData(profileData)
    setIsEditing(false)
  }

  const handleUploadPhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setAlertConfig({
          visible: true,
          type: 'warning',
          title: 'Permission Required',
          message: 'Please allow access to your photo library to upload a profile picture.',
          buttonText: 'Okay',
          onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        });
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      // Show uploading indicator
      setLoading(true);

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(result.assets[0].uri, 'profile-pictures');
      
      // Update profile with new image URL (only send image field)
      await updateProfile({ image: imageUrl });
      
      // Update local state
      setProfileData(prev => ({ ...prev, image: imageUrl }));
      setTempData(prev => ({ ...prev, image: imageUrl }));
      setImageError(false);
      
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Photo Updated',
        message: 'Your profile photo has been uploaded successfully!',
        buttonText: 'Great',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    } catch (error) {
      console.error('Upload error:', error);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload photo. Please try again.',
        buttonText: 'Try Again',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAccount = () => {
    setAlertConfig({
      visible: true,
      type: 'confirm',
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setAlertConfig(prev => ({ ...prev, visible: false }))
          await deleteProfile()
          
          // Show success and redirect
          setAlertConfig({
            visible: true,
            type: 'success',
            title: 'Account Deleted',
            message: 'Your account has been successfully deleted.',
            buttonText: 'Okay',
            onConfirm: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }))
              router.replace('/login')
            },
          })
        } catch (error) {
          setAlertConfig({
            visible: true,
            type: 'error',
            title: 'Deletion Failed',
            message: 'Failed to delete account. Please try again.',
            buttonText: 'Try Again',
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
          })
        }
      },
      onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false })),
    })
  }

  const updateField = (field: keyof ProfileData, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
              <Text style={styles.headerTitle}>My Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account</Text>
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
                style={styles.profileImage}
                onError={() => {
                  console.log('Image load error, using fallback for:', profileData.name)
                  setImageError(true)
                }}
                key={profileImageUrl} // Force re-render when URL changes
              />
              {isEditing && (
                <TouchableOpacity style={styles.cameraButton} onPress={handleUploadPhoto}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.profileName}>{profileData.name || 'User Name'}</Text>
            <View style={styles.profileBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.profileBadgeText}>Verified</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={Colors.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={tempData.name}
                    onChangeText={(text) => updateField('name', text)}
                    placeholder="Enter your full name"
                    placeholderTextColor={Colors.tertiary}
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="person" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{profileData.name || 'Not set'}</Text>
                </View>
              )}
            </View>

            {user?.userType === 'fire_officer' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Service Number</Text>
                <View style={styles.displayValue}>
                  <Ionicons name="id-card" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{profileData.serviceNumber || 'Not set'}</Text>
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={tempData.dob}
                    onChangeText={(text) => updateField('dob', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.tertiary}
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="calendar" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{formatDate(profileData.dob) || 'Not set'}</Text>
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Country</Text>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="flag-outline" size={18} color={Colors.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={tempData.country}
                    onChangeText={(text) => updateField('country', text)}
                    placeholder="Country"
                    placeholderTextColor={Colors.tertiary}
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="flag" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{profileData.country || 'Not set'}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="mail" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.displayValue}>
                <Ionicons name="call" size={18} color={Colors.primary} />
                <Text style={styles.displayText}>{profileData.phone || 'Not set'}</Text>
                {profileData.phone && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.verifiedIcon} />
                )}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={Colors.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={tempData.email}
                    onChangeText={(text) => updateField('email', text)}
                    placeholder="Enter email address"
                    placeholderTextColor={Colors.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="mail" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{profileData.email || 'Not set'}</Text>
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              {isEditing ? (
                <View style={[styles.inputContainer, styles.textareaContainer]}>
                  <Ionicons name="location-outline" size={18} color={Colors.tertiary} style={styles.inputIconTop} />
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={tempData.address}
                    onChangeText={(text) => updateField('address', text)}
                    placeholder="Enter your address"
                    placeholderTextColor={Colors.tertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="location" size={18} color={Colors.primary} />
                  <Text style={[styles.displayText, styles.addressText]}>{profileData.address || 'Not set'}</Text>
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Ghana Post GPS</Text>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="navigate-outline" size={18} color={Colors.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={tempData.ghanaPost}
                    onChangeText={(text) => updateField('ghanaPost', text)}
                    placeholder="e.g., GA-184-1234"
                    placeholderTextColor={Colors.tertiary}
                    autoCapitalize="characters"
                  />
                </View>
              ) : (
                <View style={styles.displayValue}>
                  <Ionicons name="navigate" size={18} color={Colors.primary} />
                  <Text style={styles.displayText}>{profileData.ghanaPost || 'Not set'}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
          {/* Settings */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="settings" size={18} color="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>Settings</Text>
                </View>

            <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <Ionicons name="lock-closed" size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.settingText}>Change Password</Text>
                  </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <Ionicons name="notifications" size={18} color={Colors.warning} />
                    </View>
              <Text style={styles.settingText}>Notifications</Text>
                  </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
                    </View>
                    <Text style={styles.settingText}>Privacy & Security</Text>
                  </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
            </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <Ionicons name="help-circle" size={18} color="#3B82F6" />
                    </View>
                    <Text style={styles.settingText}>Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/feedback')}
            >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <Ionicons name="chatbubble-ellipses" size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.settingText}>Send Feedback</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.tertiary} />
            </TouchableOpacity>
          </View>

              {/* Sign Out & Delete Account */}
              <View style={styles.dangerZone}>
                <TouchableOpacity 
                  style={styles.signOutButton}
                  onPress={async () => {
                    setAlertConfig({
                      visible: true,
                      type: 'confirm',
                      title: 'Sign Out',
                      message: 'Are you sure you want to sign out?',
                      confirmText: 'Sign Out',
                      cancelText: 'Cancel',
                      onConfirm: async () => {
                        setAlertConfig(prev => ({ ...prev, visible: false }))
                        await logout()
                        router.replace('/login')
                      },
                      onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false })),
                    })
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteAccountButton}
                  onPress={handleDeleteAccount}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteAccountText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
        </View>
      </AnimatedScreen>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  )
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', success: '#10B981', warning: '#E8A020' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NB.primary },
  container: { flex: 1, backgroundColor: NB.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NB.bg },
  loadingText: { marginTop: 12, fontSize: 15, color: NB.muted, fontWeight: '600' },

  headerBlock: { backgroundColor: NB.primary, borderBottomWidth: 3, borderBottomColor: NB.border },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  editHeaderButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderWidth: 2, borderColor: NB.border,
    paddingHorizontal: 12, paddingVertical: 7,
    shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  editHeaderText: { fontSize: 13, fontWeight: '800', color: NB.primary },
  cancelHeaderButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: NB.border, borderWidth: 2, borderColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  cancelHeaderText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  profileSection: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  imageWrapper: { position: 'relative', marginBottom: 14 },
  profileImage: { width: 96, height: 96, borderWidth: 3, borderColor: '#fff' },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, backgroundColor: NB.border,
    borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  profileBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  profileBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  content: { flex: 1, paddingTop: 16 },
  section: { marginBottom: 16, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: NB.border,
  },
  sectionIconContainer: {
    width: 34, height: 34, backgroundColor: NB.primary,
    borderWidth: 2, borderColor: NB.border, alignItems: 'center', justifyContent: 'center', marginRight: 10,
    shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: NB.border, textTransform: 'uppercase', letterSpacing: 0.5 },

  fieldGroup: {
    marginBottom: 12, backgroundColor: NB.surface,
    borderWidth: 2, borderColor: NB.border, padding: 14,
    ...nbShadow,
  },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: NB.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  displayValue: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  displayText: { fontSize: 15, color: NB.border, fontWeight: '600', flex: 1, lineHeight: 21 },
  addressText: { lineHeight: 22 },
  verifiedIcon: { marginLeft: 'auto' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8EF', borderWidth: 2, borderColor: NB.border,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  textareaContainer: { alignItems: 'flex-start', paddingVertical: 10 },
  inputIcon: { marginRight: 10 },
  inputIconTop: { marginRight: 10, marginTop: 2 },
  input: { flex: 1, fontSize: 15, color: NB.border, fontWeight: '600', paddingVertical: 10 },
  textarea: { minHeight: 72, textAlignVertical: 'top' },

  actionButtonsContainer: { paddingHorizontal: 16, marginBottom: 20 },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: NB.primary, paddingVertical: 15,
    borderWidth: 2, borderColor: NB.border,
    ...nbShadow,
  },
  saveButtonText: { fontSize: 15, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },

  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: NB.surface, padding: 14, marginBottom: 8,
    borderWidth: 2, borderColor: NB.border,
    shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconBg: {
    width: 36, height: 36, borderWidth: 2, borderColor: NB.border,
    backgroundColor: NB.bg, alignItems: 'center', justifyContent: 'center',
  },
  settingText: { fontSize: 15, fontWeight: '700', color: NB.border },

  dangerZone: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20, marginTop: 4 },
  signOutButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: NB.surface, paddingVertical: 14,
    borderWidth: 2, borderColor: NB.danger,
    shadowColor: NB.danger, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  signOutText: { fontSize: 13, fontWeight: '800', color: NB.danger, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteAccountButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: NB.danger, paddingVertical: 14,
    borderWidth: 2, borderColor: NB.border,
    ...nbShadow,
  },
  deleteAccountText: { fontSize: 13, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  bottomSpace: { height: 40 },
})
