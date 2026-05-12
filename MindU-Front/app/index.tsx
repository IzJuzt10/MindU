import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * PRELOAD HEAVY MODULE
 * react-native-calendars is loaded at the top level so it starts downloading
 * as soon as the app opens. This reduces the calendar screen load time.
 * The CalendarPreloaded flag tracks if the import succeeded.
 */
let CalendarPreloaded = false;
try {
  require('react-native-calendars');
  CalendarPreloaded = true;
} catch(e) {}

/**
 * SplashScreen - Animated intro screen with the MindU logo
 * 
 * Animation Sequence (Total: ~2 seconds):
 * 1. Logo fades in and bounces up (0-250ms)
 * 2. Right eye of the Ü winks closed (200-300ms)
 * 3. Star pops out from the eye and floats left while fading (300-600ms)
 * 4. Right eye opens back to normal circle shape (400-500ms)
 * 5. Auto-navigates to calendar screen at 2000ms
 * 
 * NO BACKEND INTEGRATION NEEDED - Pure UI/animation screen
 */
export default function SplashScreen() {
  const router = useRouter();
  
  // ============================================================
  // ANIMATION VALUES
  // Each useRef holds an Animated.Value that controls one property
  // useNativeDriver: true runs animations on the native thread for better performance
  // ============================================================
  const fadeIn = useRef(new Animated.Value(0)).current;           // Logo opacity: 0 → 1
  const slideUp = useRef(new Animated.Value(50)).current;         // Logo vertical position: 50 → 0
  const bounceScale = useRef(new Animated.Value(0.3)).current;    // Logo scale with spring bounce: 0.3 → 1
  const rightEyeScaleY = useRef(new Animated.Value(1)).current;   // Right eye vertical scale for wink: 1 → 0.1 → 1
  const rightEyeTranslateY = useRef(new Animated.Value(0)).current; // Right eye vertical offset during wink
  
  // Star animation values - star bursts from the winking eye
  const starOpacity = useRef(new Animated.Value(0)).current;      // Star visibility: 0 → 1 → 0
  const starTranslateX = useRef(new Animated.Value(0)).current;   // Star horizontal movement: 0 → -60
  const starTranslateY = useRef(new Animated.Value(0)).current;   // Star vertical movement: 0 → -15
  
  useEffect(() => {
    // ============================================================
    // ENTRANCE ANIMATION
    // Logo fades in, slides up, and bounces to full size
    // Runs in parallel for smooth combined effect
    // ============================================================
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(bounceScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    // ============================================================
    // WINK + STAR ANIMATION
    // Runs as a sequence: wink → star → eye opens
    // ============================================================
    Animated.sequence([
      // Small delay after entrance animation starts
      Animated.delay(200),
      
      // STEP 1: Right eye winks closed (scaleY → 0.1 = almost flat)
      Animated.parallel([
        Animated.timing(rightEyeScaleY, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rightEyeTranslateY, { toValue: 4, duration: 100, useNativeDriver: true }),
      ]),
      
      // STEP 2: Star appears at eye and floats left while fading
      Animated.parallel([
        Animated.timing(starOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(starTranslateX, { toValue: -60, duration: 300, useNativeDriver: true }),
        Animated.timing(starTranslateY, { toValue: -15, duration: 300, useNativeDriver: true }),
        // Star fades out after a brief delay
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(starOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
      ]),
      
      // STEP 3: Eye returns to normal circle shape
      Animated.parallel([
        Animated.timing(rightEyeScaleY, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(rightEyeTranslateY, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();

    // ============================================================
    // NAVIGATION TIMER
    // After 2 seconds, navigate to the main calendar screen
    // ============================================================
    const timer = setTimeout(() => {
      router.replace('/calendar');
    }, 2000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative background circles for visual depth */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />
      
      {/* Main animated content wrapper */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [
              { translateY: slideUp },
              { scale: bounceScale }
            ]
          }
        ]}
      >
        {/* MindU Logo - "Mind" in white + "U" in pink with umlaut dots as eyes */}
        <View style={styles.textContainer}>
          <Text style={styles.mindText}>Mind</Text>
          {/* U with animated umlaut dots (eyes) */}
          <View style={styles.uContainer}>
            <Text style={styles.uLetter}>U</Text>
            {/* The two dots above the Ü act as eyes */}
            <View style={styles.dotsContainer}>
              {/* Left eye - always a perfect circle (static) */}
              <View style={styles.leftDot} />
              {/* Right eye - animates for the wink effect */}
              <Animated.View 
                style={[
                  styles.rightDot,
                  {
                    transform: [
                      { scaleY: rightEyeScaleY },
                      { translateY: rightEyeTranslateY }
                    ]
                  }
                ]}
              />
              {/* Star that bursts from the winking eye */}
              <Animated.Text 
                style={[
                  styles.eyeStar,
                  {
                    opacity: starOpacity,
                    transform: [
                      { translateX: starTranslateX },
                      { translateY: starTranslateY }
                    ]
                  }
                ]}
              >
                ⭐
              </Animated.Text>
            </View>
          </View>
        </View>
        
        {/* Tagline text below the logo */}
        <Text style={styles.tagline}>your cute little reminder ✿</Text>
      </Animated.View>
    </View>
  );
}

// ============================================================
// STYLES
// All visual styling for the splash screen
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D1B69', // Deep purple background
  },
  // Decorative background circles for visual interest
  bgCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.05)', top: -50, right: -50 },
  bgCircle2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255, 255, 255, 0.03)', bottom: 100, left: -30 },
  bgCircle3: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.04)', top: '40%', left: '10%' },
  content: { alignItems: 'center' },
  textContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  // "Mind" text - white with subtle shadow
  mindText: { fontSize: 72, fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  uContainer: { position: 'relative', marginLeft: 2 },
  // "U" letter - pink color
  uLetter: { fontSize: 72, fontWeight: 'bold', color: '#FF85A2', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  // Container for the two dots (eyes) above the Ü
  dotsContainer: { position: 'absolute', top: 13, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 18 },
  // Left eye dot - static circle
  leftDot: { width: 10, height: 10, backgroundColor: '#FF85A2', borderRadius: 5 },
  // Right eye dot - animated for winking
  rightDot: { width: 10, height: 10, backgroundColor: '#FF85A2', borderRadius: 5 },
  // Star that appears from the winking eye
  eyeStar: { position: 'absolute', fontSize: 16, left: -5, top: -3 },
  // Tagline text
  tagline: { fontSize: 16, color: '#FFB6C1', marginTop: 15, fontWeight: '300', letterSpacing: 2 },
  // Unused decorative elements (kept for reference)
  bottomDecor: { position: 'absolute', bottom: 50 },
  bottomText: { fontSize: 20, letterSpacing: 10 },
});