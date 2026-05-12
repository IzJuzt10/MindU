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

// Preload calendar module at the top level - BEFORE component renders
let CalendarPreloaded = false;
try {
  require('react-native-calendars');
  CalendarPreloaded = true;
} catch(e) {}

export default function SplashScreen() {
  const router = useRouter();
  
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const bounceScale = useRef(new Animated.Value(0.3)).current;
  const rightEyeScaleY = useRef(new Animated.Value(1)).current;
  const rightEyeTranslateY = useRef(new Animated.Value(0)).current;
  
  const starOpacity = useRef(new Animated.Value(0)).current;
  const starTranslateX = useRef(new Animated.Value(0)).current;
  const starTranslateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(bounceScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    // Wink + star
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(rightEyeScaleY, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rightEyeTranslateY, { toValue: 4, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(starOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(starTranslateX, { toValue: -60, duration: 300, useNativeDriver: true }),
        Animated.timing(starTranslateY, { toValue: -15, duration: 300, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(starOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(rightEyeScaleY, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(rightEyeTranslateY, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();

    // Navigate at 2 seconds
    const timer = setTimeout(() => {
      router.replace('/calendar');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />
      
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
        <View style={styles.textContainer}>
          <Text style={styles.mindText}>Mind</Text>
          <View style={styles.uContainer}>
            <Text style={styles.uLetter}>U</Text>
            <View style={styles.dotsContainer}>
              <View style={styles.leftDot} />
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
        <Text style={styles.tagline}>your cute little reminder ✿</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
  },
  bgCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -50,
  },
  bgCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: 100,
    left: -30,
  },
  bgCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: '40%',
    left: '10%',
  },
  content: {
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mindText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  uContainer: {
    position: 'relative',
    marginLeft: 2,
  },
  uLetter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FF85A2',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    position: 'absolute',
    top: 13,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  leftDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FF85A2',
    borderRadius: 5,
  },
  rightDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FF85A2',
    borderRadius: 5,
  },
  eyeStar: {
    position: 'absolute',
    fontSize: 16,
    left: -5,
    top: -3,
  },
  tagline: {
    fontSize: 16,
    color: '#FFB6C1',
    marginTop: 15,
    fontWeight: '300',
    letterSpacing: 2,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 50,
  },
  bottomText: {
    fontSize: 20,
    letterSpacing: 10,
  },
});