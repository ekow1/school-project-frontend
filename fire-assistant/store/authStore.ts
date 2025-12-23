import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { create } from 'zustand'
import { ENV } from '../config/env'

interface User {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  country?: string
  dob?: string
  image?: string
  ghanaPost?: string
  serviceNumber?: string
  userType?: 'fire_officer' | 'regular'
}

interface ProfileData {
  name: string
  email: string
  address: string
  country: string
  dob: string
  image: string
  ghanaPost: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  hasSeenOnboarding: boolean
  
  // Actions
  register: (data: RegisterData) => Promise<void>
  verifyPhone: (phone: string, otp: string) => Promise<void>
  login: (phone: string, password: string) => Promise<void>
  officerLogin: (serviceNumber: string, password: string) => Promise<void>
  forgotPassword: (phone: string) => Promise<void>
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  initializeAuth: () => Promise<void>
  completeOnboarding: () => Promise<void>
  getProfile: () => Promise<User | null>
  updateProfile: (data: Partial<ProfileData>) => Promise<User | null>
  deleteProfile: () => Promise<void>
}

interface RegisterData {
  name: string
  phone: string
  email?: string
  password: string
  address?: string
}

const API_BASE_URL = ENV.AUTH_API_URL
const TOKEN_KEY = '@auth_token'
const USER_KEY = '@auth_user'
const ONBOARDING_KEY = '@has_seen_onboarding'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  hasSeenOnboarding: false,

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Registering user:', { ...data, password: '***' })
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Register response:', response.status, response.data)

      // Registration successful
      set({ isLoading: false, error: null })
      
    } catch (error) {
      console.error('Register error:', error)
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Registration failed'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  verifyPhone: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Verifying phone:', phone)
      
      const response = await axios.post(`${API_BASE_URL}/auth/verify-phone`, 
        { phone, otp },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Verify phone response:', response.status, response.data)

      // Phone verification successful
      set({ isLoading: false, error: null })
      
    } catch (error) {
      console.error('Verify phone error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Phone verification failed'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  forgotPassword: async (phone: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Sending forgot password OTP to:', phone)
      
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, 
        { phone },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Forgot password response:', response.status, response.data)

      // OTP sent successfully
      set({ isLoading: false, error: null })
      
    } catch (error) {
      console.error('Forgot password error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to send reset OTP'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  resetPassword: async (phone: string, otp: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Resetting password for:', phone)
      
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, 
        { phone, otp, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Reset password response:', response.status, response.data)

      // Password reset successful
      set({ isLoading: false, error: null })
      
    } catch (error) {
      console.error('Reset password error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Password reset failed'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  login: async (phone: string, password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Logging in user:', phone)
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, 
        { phone, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Login response:', response.status, response.data)

      // Get token from response
      const { token, user } = response.data
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token)
      
      // If user data is provided, save it; otherwise create a minimal user object
      const userData = user || { id: '', name: '', phone, userType: 'regular' as const }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      
      set({ 
        user: userData, 
        token,
        isLoading: false, 
        error: null 
      })
      
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Login failed'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  officerLogin: async (serviceNumber: string, password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Logging in officer:', serviceNumber)
      
      const response = await axios.post(`${API_BASE_URL}/fire/personnel/login`, 
        { serviceNumber, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Officer login response:', response.status, response.data)

      // Get token from response
      const { token, user } = response.data
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token)
      
      // Mark user as fire officer and save
      const userData = user ? { ...user, userType: 'fire_officer' as const } : { 
        id: '', 
        name: '', 
        serviceNumber, 
        userType: 'fire_officer' as const 
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      
      set({ 
        user: userData, 
        token,
        isLoading: false, 
        error: null 
      })
      
    } catch (error) {
      console.error('Officer login error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Officer login failed'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem(TOKEN_KEY)
      await AsyncStorage.removeItem(USER_KEY)
      
      // Clear state
      set({ 
        user: null, 
        token: null, 
        isLoading: false, 
        error: null 
      })
      
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      set({ isLoading: false, error: 'Failed to logout' })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  initializeAuth: async () => {
    try {
      console.log('Initializing auth...')
      
      // Load token and user from AsyncStorage
      const [token, userJson, hasSeenOnboarding] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ])
      
      console.log('Loaded from storage:', { 
        hasToken: !!token, 
        hasUser: !!userJson,
        hasSeenOnboarding: hasSeenOnboarding === 'true'
      })
      
      if (token && userJson) {
        const user = JSON.parse(userJson)
        set({ 
          token, 
          user,
          hasSeenOnboarding: hasSeenOnboarding === 'true',
          isInitialized: true 
        })
      } else {
        set({ 
          hasSeenOnboarding: hasSeenOnboarding === 'true',
          isInitialized: true 
        })
      }
    } catch (error) {
      console.error('Initialize auth error:', error)
      set({ isInitialized: true })
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      set({ hasSeenOnboarding: true })
    } catch (error) {
      console.error('Complete onboarding error:', error)
    }
  },

  getProfile: async (): Promise<User | null> => {
    const token = get().token
    const currentUser = get().user
    
    if (!token) {
      console.error('No token available')
      return null
    }

    const mapOfficerProfile = (data: any): User => {
      return {
        id: data.id || data._id || currentUser?.id || '',
        name: data.name || data.fullName || currentUser?.name || '',
        phone: data.phone || data.contactNumber || currentUser?.phone || '',
        email: data.email || currentUser?.email || '',
        address: data.address || data.station?.name || currentUser?.address || '',
        country: data.country || currentUser?.country,
        dob: data.dob || currentUser?.dob,
        image: data.image || data.photo || currentUser?.image,
        ghanaPost: data.ghanaPost || currentUser?.ghanaPost,
        serviceNumber: data.serviceNumber || data.service_number || currentUser?.serviceNumber,
        userType: 'fire_officer',
      }
    }

    try {
      console.log('Fetching profile...')
      
      const isOfficer = currentUser?.userType === 'fire_officer'
      const url = isOfficer 
        ? `${API_BASE_URL}/fire/personnel/me`
        : `${API_BASE_URL}/profile`

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })

      const userData: User = isOfficer ? mapOfficerProfile(response.data) : response.data
      console.log('Profile fetched:', userData)
      
      // Update user in state and AsyncStorage
      set({ user: userData })
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('Get profile error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to fetch profile'
      set({ error: errorMessage })
      return null
    }
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<User | null> => {
    const token = get().token
    
    if (!token) {
      console.error('No token available')
      return null
    }

    try {
      set({ isLoading: true, error: null })
      console.log('Updating profile...', data)
      
      const response = await axios.patch(`${API_BASE_URL}/profile`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })

      const userData: User = response.data
      console.log('Profile updated:', userData)
      
      // Update user in state and AsyncStorage
      set({ user: userData, isLoading: false })
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('Update profile error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to update profile'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },

  deleteProfile: async (): Promise<void> => {
    const token = get().token
    
    if (!token) {
      console.error('No token available')
      return
    }

    try {
      set({ isLoading: true, error: null })
      console.log('Deleting profile...')
      
      await axios.delete(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      })

      console.log('Profile deleted successfully')
      
      // Clear all data
      await AsyncStorage.removeItem(TOKEN_KEY)
      await AsyncStorage.removeItem(USER_KEY)
      
      set({ 
        user: null, 
        token: null, 
        isLoading: false, 
        error: null 
      })
    } catch (error) {
      console.error('Delete profile error:', error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to delete profile'
      set({ isLoading: false, error: errorMessage })
      throw error
    }
  },
}))

