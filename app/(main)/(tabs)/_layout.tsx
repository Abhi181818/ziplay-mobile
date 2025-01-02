import React from 'react';
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '@/context/AuthContext';

export default function TabLayout() {
  return (
    <AuthProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'slateblue', 
          borderRadius: 20,
          margin: 10, // Gap from all sides
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarItemStyle: {
          margin: 5, // Slight spacing between tab items
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarActiveTintColor: 'white', // Color for active tab
        tabBarInactiveTintColor: 'lightgray', // Color for inactive tabs
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name='home-outline' size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: 'Notification',
          tabBarIcon: ({ color }) => (
            <Ionicons name='notifications-outline' size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='lobby'
        options={{
          title: 'Lobby',
          tabBarBadge: 3,
          tabBarIcon: ({ color }) => (
            <Ionicons name='cart-outline' size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name='person-outline' size={22} color={color} />
          ),
        }}
      />
    </Tabs>
    </AuthProvider>
  );
}
