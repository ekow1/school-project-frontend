import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '../components/ui/splash';
import { AlertProvider } from '../context/AlertContext';
import { LocationProvider } from '../context/LocationContext';
import { useAuthStore } from '../store/authStore';
import '../styles/global.css';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  
  const { token, hasSeenOnboarding, isInitialized, initializeAuth } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Hide splash after fonts loaded and small delay
  useEffect(() => {
    if (loaded) {
      const timeout = setTimeout(() => setShowSplash(false), 3000); // 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  // Show splash while loading
  if (!loaded || showSplash || !isInitialized) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <LocationProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </LocationProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { token, hasSeenOnboarding, isInitialized } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    
    // Only perform initial navigation once to avoid flash
    if (!hasNavigated) {
      // Determine initial route based on auth state
      if (token) {
        router.replace('/(tabs)');
      } else if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/login');
      }
      setHasNavigated(true);
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inAuthScreens = ['login', 'officer-login', 'register', 'reset', 'verify', 'new-password', 'forgot-password', 'reset-password'].includes(segments[0] as string);

    console.log('Navigation check:', { 
      hasToken: !!token, 
      hasSeenOnboarding, 
      segments,
      inAuthGroup,
      inOnboarding,
      inAuthScreens
    });

    // Priority 1: If logged in, redirect away from auth screens and onboarding
    if (token) {
      if (inAuthScreens || inOnboarding) {
        router.replace('/(tabs)');
      }
    }
    // Priority 2: If not logged in
    else {
      // If trying to access main app, redirect to login
      if (inAuthGroup) {
        router.replace('/login');
      }
      // If first-time user (not seen onboarding), redirect to onboarding
      else if (!hasSeenOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      }
      // If has seen onboarding but not in auth screens, redirect to login
      else if (hasSeenOnboarding && !inAuthScreens && !inOnboarding) {
        router.replace('/login');
      }
    }
  }, [token, hasSeenOnboarding, segments, isInitialized, hasNavigated]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="officer-login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset" options={{ headerShown: false }} />
      <Stack.Screen name="new-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
