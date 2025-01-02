import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ScrollView, 
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signInWithRedirect, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as CountryStateCity from 'country-state-city';
import * as WebBrowser from 'expo-web-browser';

// Types
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  city: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  data: Array<{ name: string; isoCode?: string; }>;
  onSelect: (item: any) => void;
  onClose: () => void;
  searchPlaceholder: string;
}

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

// Picker Modal Component
const PickerModal: React.FC<PickerModalProps> = ({ visible, title, data, onSelect, onClose, searchPlaceholder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.isoCode || item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    city: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formScale = useSharedValue(1);

  const bounceForm = () => {
    formScale.value = withSpring(0.95, {}, () => {
      formScale.value = withSpring(1);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formScale.value }]
  }));

  const countries = CountryStateCity.Country.getAllCountries();
  const states = formData.country ? CountryStateCity.State.getStatesOfCountry(formData.country) : [];
  const cities = formData.state ? CountryStateCity.City.getCitiesOfState(formData.country, formData.state) : [];

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.name) newErrors.name = "Name is required 👤";
    if (!formData.email) newErrors.email = "Email is required 📧";
    if (!formData.password) newErrors.password = "Password is required 🔒";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters 🔒";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match! 🔑";
    }
    if (!formData.country) newErrors.country = "Please select your country 🌎";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountrySelect = (country: { isoCode: string }) => {
    setFormData(prev => ({
      ...prev,
      country: country.isoCode,
      state: '',
      city: ''
    }));
  };

  const handleStateSelect = (state: { isoCode: string }) => {
    setFormData(prev => ({
      ...prev,
      state: state.isoCode,
      city: ''
    }));
  };

  const handleCitySelect = (city: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      city: city.name
    }));
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleEmailSignup = async () => {
    bounceForm();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        createdAt: new Date().toISOString()
      });

      router.push('/home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.formContainer, animatedStyle]}>
          <Text style={styles.welcomeText}>Join Our Community! 👋</Text>
          <Text style={styles.subtitleText}>Create an account to get started</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="What's your name?"
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Your email address"
              value={formData.email}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, email: text }));
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, password: text }));
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
            </TouchableOpacity>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
            </TouchableOpacity>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="globe-outline" size={20} color="#6b7280" style={styles.icon} />
            <TouchableOpacity 
              style={[styles.pickerButton, errors.country && styles.inputError]} 
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={[
                styles.pickerButtonText,
                formData.country && styles.pickerButtonTextSelected
              ]}>
                {formData.country 
                  ? countries.find(c => c.isoCode === formData.country)?.name 
                  : 'Select your country'}
              </Text>
            </TouchableOpacity>
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
          </View>

          {formData.country && (
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6b7280" style={styles.icon} />
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowStatePicker(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  formData.state && styles.pickerButtonTextSelected
                ]}>
                  {formData.state 
                    ? states.find(s => s.isoCode === formData.state)?.name 
                    : 'Select your state'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {formData.state && (
            <View style={styles.inputContainer}>
              <Ionicons name="pin-outline" size={20} color="#6b7280" style={styles.icon} />
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowCityPicker(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  formData.city && styles.pickerButtonTextSelected
                ]}>
                  {formData.city || 'Select your city'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={handleEmailSignup}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.signupButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} ></View>
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.divider} ></View>
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignup}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <PickerModal
        visible={showCountryPicker}
        title="Select Your Country 🌎"
        data={countries}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryPicker(false)}
        searchPlaceholder="Search for your country"
      />
<PickerModal
        visible={showStatePicker}
        title="Select Your State 📍"
        data={states}
        onSelect={handleStateSelect}
        onClose={() => setShowStatePicker(false)}
        searchPlaceholder="Search for your state"
      />
      <PickerModal
        visible={showCityPicker}
        title="Select Your City 🏙"
        data={cities}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
        searchPlaceholder="Search for your city"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    elevation: 5,
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  icon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    zIndex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 16,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pickerButtonTextSelected: {
    color: '#111827',
  },
  signupButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  orText: {
    color: '#6b7280',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#ea4335',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  searchContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: '#111827',
  },
  pickerItem: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});