import React from 'react';
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';

export default function TabLayout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarShowLabel: false, // Hide labels
          tabBarActiveTintColor: '#FF0000', // Accent color for active tab
          tabBarInactiveTintColor: '#B0B0B0', // Gray for inactive tabs
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lobby"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="cart-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="notifications-outline" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF', // Light theme background
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 10,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light border for aesthetics
  },
});
