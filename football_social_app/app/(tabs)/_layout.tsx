import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="matches" 
        options={{ 
          title: 'Matches',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="soccer" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="feed" 
        options={{ 
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="rss-box" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="compass" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}
