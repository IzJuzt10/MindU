import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {  // Added navigation prop
  // Animation values for the right eye winking
  const rightEyeScaleY = useRef(new Animated.Value(1)).current;
  const rightEyeTranslateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create the wink animation sequence for the right eye
    const winkAnimation = Animated.sequence([
      // First wink
      Animated.parallel([
        Animated.timing(rightEyeScaleY, {
          toValue: 0.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rightEyeTranslateY, {
          toValue: 4,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Slight pause while closed
      Animated.delay(200),
      // Open back up
      Animated.parallel([
        Animated.timing(rightEyeScaleY, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rightEyeTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Run the animation
    winkAnimation.start();

    // Navigate to Login after splash duration
    const navigationTimer = setTimeout(() => {
      navigation.replace('Login');  // Navigate to login screen
    }, 2500);  // Adjust timing as needed

    // Cleanup
    return () => {
      winkAnimation.stop();
      clearTimeout(navigationTimer);
    };
  }, [navigation]);  // Added navigation to dependency array

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {/* "Mind" text */}
        <Text style={styles.mindText}>Mind</Text>
        
        {/* Ü letter with winking right eye */}
        <View style={styles.uContainer}>
          {/* Main U letter */}
          <Text style={styles.uLetter}>U</Text>
          
          {/* Two dots above the U (eyes) */}
          <View style={styles.dotsContainer}>
            {/* Left eye - static */}
            <View style={styles.leftDot} />
            
            {/* Right eye - animated (winking) */}
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
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#193035',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mindText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  uContainer: {
    position: 'relative',
    marginLeft: 2,
  },
  uLetter: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#A04B2E',
  },
  dotsContainer: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  leftDot: {
    width: 12,
    height: 12,
    backgroundColor: '#A04B2E',
    borderRadius: 6,
  },
  rightDot: {
    width: 12,
    height: 12,
    backgroundColor: '#A04B2E',
    borderRadius: 6,
  },
});

export default SplashScreen;