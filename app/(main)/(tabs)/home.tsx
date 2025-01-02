import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationHeader from '@/components/LocationHeader';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const { user, loading } = useAuth();
  const location = "Bangalore"; // Fixed location value

  if (loading) {
    return <ActivityIndicator size="large" color="#1f2937" />;
  }

  if (!user) {
    return <Text>User is not logged in</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LocationHeader location={location} />
      <SearchBar />
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to Home</Text>
        <Text style={styles.text}>Your Location: {location}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default Home;
