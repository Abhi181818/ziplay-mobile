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
  SafeAreaView 
} from 'react-native';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/config/firebase';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as CountryStateCity from 'country-state-city';

// Picker Modal Component
const PickerModal = ({ visible, title, data, onSelect, onClose, searchPlaceholder }: { visible: boolean, title: string, data: any[], onSelect: (item: any) => void, onClose: () => void, searchPlaceholder: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = data.filter((item: { name: string; }) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    city: ''
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; country?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const router = useRouter();
  const formScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formScale.value }]
  }));

  const countries = CountryStateCity.Country.getAllCountries();
  const states = formData.country ? CountryStateCity.State.getStatesOfCountry(formData.country) : [];
  const cities = formData.state ? CountryStateCity.City.getCitiesOfState(formData.country, formData.state) : [];

  const handleCountrySelect = (country: { isoCode: any; }) => {
    setFormData(prev => ({
      ...prev,
      country: country.isoCode || '',
      state: '',
      city: ''
    }));
  };

  const handleStateSelect = (state: { isoCode: any; }) => {
    setFormData(prev => ({
      ...prev,
      state: state.isoCode || '',
      city: ''
    }));
  };

  const handleCitySelect = (city: { name: any; }) => {
    setFormData(prev => ({
      ...prev,
      city: city.name
    }));
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        name: user.displayName,
        email: user.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      router.push('/home'); // Navigate to home after successful signup
    } catch (error) {
      Alert.alert('Error', (error as any).message);
    }
  };

  const handleEmailSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const userData = {
        name: formData.name,
        email: user.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      router.push('/home'); // Navigate to home after successful signup
    } catch (error) {
      Alert.alert('Error', (error as any).message);
    }
  };

  return (
    <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.formContainer, animatedStyle]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
            </TouchableOpacity>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
            </TouchableOpacity>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Icon name="globe-outline" size={20} color="#6b7280" style={styles.icon} />
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCountryPicker(true)}>
              <Text style={[styles.pickerButtonText, formData.country && styles.pickerButtonTextSelected]}>
                {formData.country ? countries.find(c => c.isoCode === formData.country)?.name : 'Select Country'}
              </Text>
            </TouchableOpacity>
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
          </View>

          {formData.country && (
            <View style={styles.inputContainer}>
              <Icon name="location-outline" size={20} color="#6b7280" style={styles.icon} />
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
                <Text style={[styles.pickerButtonText, formData.state && styles.pickerButtonTextSelected]}>
                  {formData.state ? states.find(s => s.isoCode === formData.state)?.name : 'Select State'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {formData.state && (
            <View style={styles.inputContainer}>
              <Icon name="pin-outline" size={20} color="#6b7280" style={styles.icon} />
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCityPicker(true)}>
                <Text style={[styles.pickerButtonText, formData.city && styles.pickerButtonTextSelected]}>
                  {formData.city || 'Select City'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.signupButton} onPress={handleEmailSignup}>
            <Text style={styles.signupButtonText}>Sign Up with Email</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>OR</Text>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup}>
            <Text style={styles.googleButtonText}>Sign Up with Google</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <PickerModal
        visible={showCountryPicker}
        title="Select Country"
        data={countries}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryPicker(false)}
        searchPlaceholder="Search for a country"
      />
      <PickerModal
        visible={showStatePicker}
        title="Select State"
        data={states}
        onSelect={handleStateSelect}
        onClose={() => setShowStatePicker(false)}
        searchPlaceholder="Search for a state"
      />
      <PickerModal
        visible={showCityPicker}
        title="Select City"
        data={cities}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
        searchPlaceholder="Search for a city"
      />
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingLeft: 40,
    paddingRight: 10,
    fontSize: 16,
    backgroundColor: '#f3f4f6',
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 14,
  },
  pickerButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,  
    paddingLeft: 40,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  pickerButtonTextSelected: {
    color: '#1f2937',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  pickerItem: {
    padding: 16,
    backgroundColor: '#fff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  signupButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#db4437',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  orText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});