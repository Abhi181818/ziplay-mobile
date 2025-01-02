// app/searchresults/venues.tsx
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationHeader from '@/components/LocationHeader';
import Venues from '@/components/Venues';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

export default function VenuesScreen() {
  const { query } = useLocalSearchParams();
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem('location');
        if (storedLocation) {
          setLocation(storedLocation);
        } else {
          setLocation('Bangalore');
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
        <Venues initialSearch={query as string} location={location} />
      </View>
    </SafeAreaView>
  );
}