import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

const carouselData = [
  {
    id: 1,
    title: 'Help Is Never Far',
    subtitle: 'Detect Nearby Fire Station',
    description: "We'll show you the closest fire station, fast.",
    accent: 'Never Far'
  },
  {
    id: 2,
    title: 'Report in Seconds',
    subtitle: 'Report an Incident',
    description: 'Spotted a fire? Share location and details instantly.',
    accent: 'Seconds'
  },
  {
    id: 3,
    title: 'Ask Our AI for Help',
    subtitle: 'Fire Safety Chat Assistant',
    description: 'Got a fire question? Our assistant is always ready.',
    accent: 'AI for Help'
  },
  {
    id: 4,
    title: 'Stay Safe, Stay Smart',
    subtitle: 'Fire Safety Tips',
    description: 'Learn easy fire safety tips every day.',
    accent: 'Stay Smart'
  }
];

const ORANGE = '#e02a1f';

export default function FireSafetyOnboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderStarted, setSliderStarted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const sliderOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial card animation
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Start slider after 10 seconds
    const startTimer = setTimeout(() => {
      setSliderStarted(true);
      Animated.timing(sliderOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 2000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!sliderStarted) return;

    const interval = setInterval(() => {
      // Animate out current content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Update index
        setCurrentIndex((prevIndex) => 
          prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
        );
        
        // Reset and animate in new content
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [sliderStarted]);

  const currentItem = carouselData[currentIndex];

  const renderTitle = (title: string, accent: string) => {
    const parts = title.split(accent);
    if (parts.length === 2) {
      return (
        <Text style={styles.featureTitle}>
          {parts[0]}
          <Text style={styles.accentText}>{accent}</Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.featureTitle}>{title}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Full Background Image */}
      <Image
        source={{
          uri: 'https://res.cloudinary.com/ddwet1dzj/image/upload/v1749737356/industrial-firefighting-med-min.jpg_q1wn2h.webp'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Background Overlay */}
      <View style={styles.backgroundOverlay} />
      
      {/* Top Brand Section */}
      <View style={styles.topSection}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>FIRE GUARD</Text>
          <View style={styles.brandDot} />
        </View>
      </View>
      
      {/* Main Content Card */}
      <Animated.View 
        style={[
          styles.contentCard,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }]
          }
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHandle} />
        </View>
        
        {/* Content Area */}
        <View style={styles.cardContent}>
          
          {/* Text Content */}
          <Animated.View 
            style={[
              styles.textContent,
              { opacity: sliderStarted ? sliderOpacity : 1 }
            ]}
          >
            {sliderStarted ? (
              <Animated.View 
                style={[
                  styles.carouselContent,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.categoryTag}>{currentItem.subtitle}</Text>
                {renderTitle(currentItem.title, currentItem.accent)}
                <Text style={styles.description}>{currentItem.description}</Text>
                
                {/* Feature Highlights */}
                <View style={styles.highlightContainer}>
                  <View style={styles.highlight}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>Real-time alerts</Text>
                  </View>
                  <View style={styles.highlight}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>24/7 availability</Text>
                  </View>
                </View>
                
                {/* Indicators */}
                <View style={styles.indicatorContainer}>
                  {carouselData.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index === currentIndex && styles.activeIndicator
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>
            ) : (
              <View style={styles.initialContent}>
                <Text style={styles.categoryTag}>Emergency Response</Text>
                <Text style={styles.welcomeTitle}>
                  Stay <Text style={styles.accentText}>protected</Text>,{'\n'}
                  stay <Text style={styles.accentText}>informed</Text>!
                </Text>
                <Text style={styles.welcomeDescription}>
                  Your comprehensive fire safety companion for emergency situations and daily safety tips
                </Text>
                
                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>24/7</Text>
                    <Text style={styles.statLabel}>Support</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>1000+</Text>
                    <Text style={styles.statLabel}>Stations</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>AI</Text>
                    <Text style={styles.statLabel}>Assistant</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
          
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.ctaButton} 
              activeOpacity={0.8} 
              onPress={() => {
                useAuthStore.getState().completeOnboarding();
                router.replace('/login');
              }}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <View style={styles.buttonArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.footerText}>Emergency services • Available nationwide</Text>
          </View>
          
        </View>
      </Animated.View>
      
      {/* Floating Elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />
      
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  backgroundOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topSection: {
    position: 'absolute', // Position absolutely to float above image
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 2, // Ensure it's above the image and card
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandDot: {
    width: 6,
    height: 6,
    backgroundColor: ORANGE,
    borderRadius: 3,
    marginLeft: 8,
  },
  contentCard: {
    position: 'absolute', // Position absolutely to control placement
    bottom: 0, // Anchor to the bottom
    width: '100%',
    height: height * 0.5, // Set height to 50% of screen, starting at mid-point
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 1, // Ensure it's above the image
  },
  cardHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 60,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  initialContent: {
    alignItems: 'center',
  },
  carouselContent: {
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '600',
    color: ORANGE,
    backgroundColor: 'rgba(224, 42, 31, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  accentText: {
    color: ORANGE,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: ORANGE,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  highlightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightDot: {
    width: 6,
    height: 6,
    backgroundColor: ORANGE,
    borderRadius: 3,
    marginRight: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeIndicator: {
    backgroundColor: ORANGE,
    width: 24,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: ORANGE,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonArrow: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  floatingElement1: {
    position: 'absolute',
    top: height * 0.3,
    right: 20,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(224, 42, 31, 0.3)',
    borderRadius: 6,
  },
  floatingElement2: {
    position: 'absolute',
    top: height * 0.25,
    left: 30,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
  },
});
