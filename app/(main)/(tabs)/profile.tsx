import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { auth } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';

const Profile = () => {
  const [userDetails, setUserDetails] = useState<{ name: string; phone: string } | null>(null);

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data() as { name: string; phone: string });
        }
      }
    };

    fetchUserDetails();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error: any) {
      Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
    }
  };

  const optionsList = [
    { icon: 'calendar', label: 'Bookings', color: '#4f46e5' },
    { icon: 'call', label: 'Contact Us', color: '#4f46e5' },
    { icon: 'chatbubble', label: 'Feedback', color: '#4f46e5' },
    { icon: 'document-text', label: 'Terms & Conditions', color: '#4f46e5' },
    { icon: 'log-out', label: 'Logout', color: '#ef4444', onPress: handleLogout },
  ];

  return (
    <LinearGradient
      colors={['#ffffff', '#f3f4f6']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Details Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>
            {userDetails?.name || 'User Name'}
          </Text>
          <Text style={styles.userPhone}>
            {userDetails?.phone || '+123 456 7890'}
          </Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {optionsList.map((option, index) => (
            <TouchableOpacity
              key={option.label}
              style={styles.option}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <Icon name={option.icon} size={24} color={option.color} />
              <Text style={[
                styles.optionText,
                { color: option.color }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 16,
    color: '#6b7280',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
  },
});

export default Profile;