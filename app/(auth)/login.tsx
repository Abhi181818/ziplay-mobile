import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ToastAndroid } from 'react-native';
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Enhanced animations for gaming feel
  const emailScale = useSharedValue(1);
  const passwordScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);

  const animatedEmailStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emailScale.value }],
  }));

  const animatedPasswordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordScale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    shadowOpacity: buttonGlow.value,
  }));

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
      
      const successMessage = 'Login Successful - Welcome Back, Player!';
      if (Platform.OS === 'android') {
        ToastAndroid.show(successMessage, ToastAndroid.SHORT);
      } else {
        Alert.alert('Level Up!', successMessage);
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', 'Invalid username or password. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', 'Unable to connect with Google. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#1a1b2e', '#2d2e4a']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Icon name="game-controller" size={50} color="#7f5af0" />
        <Text style={styles.title}>User Login</Text>
        <Text style={styles.subtitle}>Ready </Text>
      </View>

      <Animated.View
        style={[styles.inputContainer, animatedEmailStyle]}
        onTouchStart={() => {
          emailScale.value = withSpring(1.02);
        }}
        onTouchEnd={() => {
          emailScale.value = withSpring(1);
        }}
      >
        <Icon name="mail-outline" size={20} color="#7f5af0" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a1b2"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </Animated.View>

      <Animated.View
        style={[styles.inputContainer, animatedPasswordStyle]}
        onTouchStart={() => {
          passwordScale.value = withSpring(1.02);
        }}
        onTouchEnd={() => {
          passwordScale.value = withSpring(1);
        }}
      >
        <Icon name="lock-closed-outline" size={20} color="#7f5af0" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a1b2"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
      </Animated.View>

      <Animated.View
        style={[styles.loginButton, animatedButtonStyle]}
        onTouchStart={() => {
          buttonScale.value = withSpring(0.95);
          buttonGlow.value = withTiming(0.8);
        }}
        onTouchEnd={() => {
          buttonScale.value = withSpring(1);
          buttonGlow.value = withTiming(0.3);
        }}
      >
        <TouchableOpacity onPress={handleLogin} style={styles.buttonContent}>
          <LinearGradient
            colors={['#7f5af0', '#6930c3']}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Icon name="logo-google" size={20} color="#fff" style={styles.googleIcon} />
        <Text style={styles.buttonText}>SIGN IN WITH GOOGLE</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>
          New Player? <Text style={styles.linkHighlight}>Create Account</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fffffe',
    marginTop: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a1b2',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'android' ? 2 : 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(127, 90, 240, 0.3)',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#fffffe',
  },
  loginButton: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    width: '100%',
  },
  buttonText: {
    color: '#fffffe',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  link: {
    color: '#94a1b2',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#7f5af0',
    fontWeight: 'bold',
  },
});