"use client"

import { useEffect, useRef } from "react"
import { Animated, Platform, StatusBar, StyleSheet, View } from "react-native"

// Define your app version here
const APP_VERSION = "1.0.0"

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current // For fading in elements
  const scaleAnim = useRef(new Animated.Value(0.8)).current // For initial zoom effect
  const pulseAnim = useRef(new Animated.Value(1)).current // For continuous pulse effect

  useEffect(() => {
    // Initial fade-in and zoom animation for all elements
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200, // Fade in duration
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5, // Controls the bounciness
        tension: 80, // Controls the speed
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08, // Scale up slightly
          duration: 800, // Duration of the scale-up
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // Scale back to original size
          duration: 800, // Duration of the scale-down
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: -1, // Loop indefinitely
      },
    ).start()

    return () => {
      fadeAnim.stopAnimation()
      scaleAnim.stopAnimation()
      pulseAnim.stopAnimation()
    }
  }, [fadeAnim, scaleAnim, pulseAnim])

  return (
    <View style={styles.fullScreen}>
      <StatusBar hidden translucent backgroundColor="#e02a1f" barStyle="light-content" />
      <Animated.Image
        source={{ uri: 'https://res.cloudinary.com/ddwet1dzj/image/upload/v1745603414/samples/gE0ZW3qx_400x400_kyfgdz.jpg' }}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }], // Combine initial zoom and pulse
          },
        ]}
        resizeMode="contain"
        accessibilityLabel="Fire Service Logo"
      />
      <Animated.Text style={[styles.versionText, { opacity: fadeAnim }]}>Version {APP_VERSION}</Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#e02a1f", // Use the specified color
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  versionText: {
    position: "absolute", // Position absolutely at the bottom
    bottom: Platform.OS === "ios" ? 50 : 30, // Use a bit more space for iOS safe area
    fontSize: 14,
    color: "#FFFFFF", // White color for version text on dark background
    letterSpacing: 0.5,
    alignSelf: "center",
  },
})
