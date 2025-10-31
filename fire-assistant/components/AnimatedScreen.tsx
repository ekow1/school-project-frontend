import React, { useEffect, useRef } from "react"
import { Animated, Dimensions, StyleSheet } from "react-native"

const { width, height } = Dimensions.get("window")

interface AnimatedScreenProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "fade"
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
  children,
  delay = 0,
  duration = 800,
  direction = "up",
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(direction === "up" ? 50 : direction === "down" ? -50 : 0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = []

    // Fade animation
    animations.push(
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      })
    )

    // Slide animation
    if (direction !== "fade") {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        })
      )
    }

    // Scale animation for subtle zoom effect
    animations.push(
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      })
    )

    // Start all animations
    Animated.parallel(animations).start()
  }, [fadeAnim, slideAnim, scaleAnim, delay, duration, direction])

  const getTransformStyle = () => {
    switch (direction) {
      case "up":
        return {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }
      case "down":
        return {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }
      case "left":
        return {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        }
      case "right":
        return {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        }
      case "fade":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      default:
        return {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }
    }
  }

  return (
    <Animated.View style={[styles.container, getTransformStyle()]}>
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default AnimatedScreen 