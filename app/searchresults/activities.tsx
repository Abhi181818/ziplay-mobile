// app/searchresults/activities.tsx
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationHeader from '@/components/LocationHeader';
import Activities from '@/components/Activities';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

export default function ActivitiesScreen() {
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem('location');
        if (storedLocation) {
          setLocation(storedLocation);
        } else {
          setLocation('Location not found');
        }
      } catch (error) {
        console.error('Failed to fetch location from storage:', error);
      }
    };
    fetchLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LocationHeader location={location || 'Fetching location...'} />
      <View style={styles.tabContainer}>
        <Activities />
      </View>
    </SafeAreaView>
  );
}