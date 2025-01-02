import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      // Navigate to the venues tab of searchresults with the query
      router.push({
        pathname: '/searchresults/venues',
        params: { query: query.trim() }
      });
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSearch}>
        <Icon 
          name="search-outline" 
          size={20} 
          color="#6b7280" 
          style={{ marginHorizontal: 10 }} 
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Search anything here..."
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')}>
          <Icon 
            name="close-circle" 
            size={20} 
            color="#6b7280" 
            style={{ marginHorizontal: 10 }} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#374151',
  },
});

export default SearchBar;