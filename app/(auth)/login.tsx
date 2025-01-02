import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/home');
      }
    });

    return () => unsubscribe();
  }, []);

  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const emailScale = useSharedValue(1);
  const passwordScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const googleButtonScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 400 }),
      withTiming(1, { duration: 200 })
    );
    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: withTiming(formOpacity.value * 0, { duration: 1000 }) }],
  }));

  const handleInputFocus = (scale: Animated.SharedValue<number>) => {
    scale.value = withSpring(1.02, { damping: 12 });
  };

  const handleInputBlur = (scale: Animated.SharedValue<number>) => {
    scale.value = withSpring(1);
  };

  const handleButtonPress = async (handler: () => Promise<void>, scale: Animated.SharedValue<number>) => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    await handler();
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        Alert.alert('Email Not Verified', 'Please check your email for verification.');
        return;
      }

      formOpacity.value = withTiming(0, { duration: 300 });
      logoScale.value = withTiming(0, { duration: 300 });

      setTimeout(() => {
        router.push('/home');
        if (Platform.OS === 'android') {
          ToastAndroid.show('Welcome back!', ToastAndroid.SHORT);
        }
      }, 300);
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Sign-In Failed', 'Please try again later.');
    }
  };

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          if (user) {
            if (!user.emailVerified) {
              await sendEmailVerification(user);
              Alert.alert('Email Not Verified', 'Please verify your email.');
              return;
            }
            router.push('/home');
            if (Platform.OS === 'android') {
              ToastAndroid.show('Welcome back!', ToastAndroid.SHORT);
            }
          }
        }
      } catch (error) {
        console.error('Redirect Result Error:', error);
        Alert.alert('Authentication Error', 'Failed to handle the Google sign-in.');
      }
    };

    checkRedirectResult();
  }, []);
  return (
    <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.logoBackground}>
            <Icon name="log-in" size={50} color="#ffffff" />
          </LinearGradient>
          <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.title}>
            Welcome Back
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.subtitle}>
            Sign in to continue
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, animatedFormStyle]}>
          <Animated.View style={[styles.inputContainer]} entering={FadeInDown.delay(500).springify()}>
            <Icon name="mail-outline" size={20} color="#4f46e5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => handleInputFocus(emailScale)}
              onBlur={() => handleInputBlur(emailScale)}
            />
          </Animated.View>

          <Animated.View style={[styles.inputContainer]} entering={FadeInDown.delay(600).springify()}>
            <Icon name="lock-closed-outline" size={20} color="#4f46e5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => handleInputFocus(passwordScale)}
              onBlur={() => handleInputBlur(passwordScale)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleButtonPress(handleLogin, buttonScale)} style={styles.buttonContent}>
              <LinearGradient colors={['#4f46e5', '#6366f1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                <Icon name="arrow-forward-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()}>
            <TouchableOpacity style={styles.googleButton} onPress={() => handleButtonPress(handleGoogleSignIn, googleButtonScale)}>
              <LinearGradient colors={['#ea4335', '#dc4e41']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                <Icon name="logo-google" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>SIGN IN WITH GOOGLE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(900)} style={styles.linkContainer}>
            <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkButton}>
              <Text style={styles.link}>
                Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'android' ? 2 : 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  buttonContent: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradientButton: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  googleButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#ea4335',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  linkContainer: {
    marginTop: 10,
  },
  linkButton: {
    padding: 10,
  },
  link: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#4f46e5',
    fontWeight: 'bold',
  },
});