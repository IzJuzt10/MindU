import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VerificationCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = () => {
    if (code.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }
    // Here you would typically verify the code with your backend
    alert('Code verified successfully!');
    router.replace('/calendar');
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      // Here you would typically resend the code via email
      alert('Verification code resent to your email');
      setResendTimer(60); // 60 second cooldown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to 6 digits
    if (numericText.length <= 6) {
      setCode(numericText);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to your email. Please enter it below.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              ref={inputRef}
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor="#CCCCCC"
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />
          </View>

          <TouchableOpacity 
            style={styles.verifyButton} 
            onPress={handleVerify}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={resendTimer > 0}
            >
              <Text 
                style={[
                  styles.resendLink,
                  resendTimer > 0 && styles.resendLinkDisabled
                ]}
              >
                Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              Back to <Text style={styles.backTextBold}>Signup</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 50,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputWrapper: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 18,
    fontSize: 32,
    fontWeight: '600',
    color: '#6C63FF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
  },
  resendLink: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#CCCCCC',
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    color: '#666666',
  },
  backTextBold: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
