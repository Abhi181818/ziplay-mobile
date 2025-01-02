import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '@/config/firebase';

const { width } = Dimensions.get('window');
const CARD_PADDING = 15;

interface VenueProps {
  initialSearch?: string;
  location?: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  description: string;
  openingHours: string;
  slug: string;
}

const Venues: React.FC<VenueProps> = ({ initialSearch = '', location = '' }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState(initialSearch);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const venuesCollection = collection(db, 'venues');

      let venuesQuery;

      if (location) {
        venuesQuery = query(
          venuesCollection,
          where('address', '==', location) // Adjust as needed
        );
      } else {
        venuesQuery = venuesCollection;
      }

      const querySnapshot = await getDocs(venuesQuery);

      const data = querySnapshot.docs.map(doc => {
        const venueData = doc.data();
        return {
          id: doc.id,
          name: venueData.name,
          address: venueData.address,
          imageUrl: venueData.imageUrl,
          description: venueData.description,
          openingHours: venueData.openingHours,
          slug: venueData.slug,
        };
      });

      console.log('Fetched Venues:', data);

      setVenues(data);
    } catch (error) {
      setError('Failed to load venues. Please try again.');
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  useEffect(() => {
    getVenues();
  }, [getVenues]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getVenues();
  }, [getVenues]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    return sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const renderVenueCard = ({ item: venue }: { item: Venue }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: venue.imageUrl }}
        style={styles.venueImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.venueName}>{venue.name}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#4B5563" />
          <Text style={styles.infoText} numberOfLines={1}>
            {venue.address}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#4B5563" />
          <Text style={styles.infoText}>{venue.openingHours}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {venue.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues by name"
          value={filter}
          onChangeText={setFilter}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
      >
        <Ionicons
          name={sortOrder === 'asc' ? 'arrow-down' : 'arrow-up'}
          size={20}
          color="#4B5563"
        />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getVenues}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {filteredVenues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No venues found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search criteria
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedVenues}
          renderItem={renderVenueCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    padding: CARD_PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  sortButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    padding: CARD_PADDING,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  venueImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 8,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default Venues;
