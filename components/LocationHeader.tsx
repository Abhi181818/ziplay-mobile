import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const LocationHeader = ({ location }: { location: string }) => {
  return (
    <View style={styles.container}>
      <Icon name="location-outline" size={20} color="#1f2937" style={{ marginRight: 5 }} />
      <Text style={styles.locationText}>{location}</Text>
      <Icon name="chevron-down-outline" size={20} color="#1f2937" style={{ marginLeft: 5 }}  />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default LocationHeader;
