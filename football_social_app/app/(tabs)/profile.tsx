import React, { type ComponentProps } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const stats: { label: string; value: string; icon: MciName }[] = [
    { label: 'Matches', value: '12', icon: 'soccer' },
    { label: 'Goals', value: '24', icon: 'target' },
    { label: 'Assists', value: '8', icon: 'basketball' },
    { label: 'Rating', value: '8.5', icon: 'star' },
  ];

  const menuItems: { icon: MciName; label: string; onPress: () => void }[] = [
    { icon: 'information', label: 'Profile Details', onPress: () => router.push("/(modules)/profile-details" as any) },
    { icon: 'history', label: 'Performance History', onPress: () => {} },
    { icon: 'medal', label: 'Achievements', onPress: () => {} },
    { icon: 'pencil-outline', label: 'My Posts', onPress: () => router.push("/(modules)/my-posts" as any) },
    { icon: 'cog', label: 'Settings', onPress: () => {} },
    { icon: 'shield-lock', label: 'Privacy & Security', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👨‍🦱</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username || 'Player'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.positionBadge}>
              <MaterialCommunityIcons name="soccer-field" size={14} color="#FF6B6B" />
              <Text style={styles.positionText}>Midfielder</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <MaterialCommunityIcons name={stat.icon} size={24} color="#4ECDC4" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Player Card */}
        <View style={styles.playerCardSection}>
          <Text style={styles.sectionTitle}>Current Season</Text>
          <View style={styles.playerCard}>
            <View style={styles.playerCardHeader}>
              <View>
                <Text style={styles.playerCardName}>2024-25 Season</Text>
                <Text style={styles.playerCardTeam}>Your Performance Summary</Text>
              </View>
              <Text style={styles.jerseyNumber}>10</Text>
            </View>
            <View style={styles.playerCardStats}>
              <View style={styles.pcStat}>
                <Text style={styles.pcStatLabel}>Total Games</Text>
                <Text style={styles.pcStatValue}>12</Text>
              </View>
              <View style={styles.pcStat}>
                <Text style={styles.pcStatLabel}>Avg Rating</Text>
                <Text style={styles.pcStatValue}>8.5</Text>
              </View>
              <View style={styles.pcStat}>
                <Text style={styles.pcStatLabel}>Win Rate</Text>
                <Text style={styles.pcStatValue}>75%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            {[
              { icon: '🏆', label: '8.5 Star Player' },
              { icon: '⚡', label: 'Speed Demon' },
              { icon: '🎯', label: 'Accurate Passer' },
            ].map((achievement, idx) => (
              <View key={idx} style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                <Text style={styles.achievementLabel}>{achievement.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.menuItem,
                idx !== menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <MaterialCommunityIcons name={item.icon} size={20} color="#666" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="white" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  statsSection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  playerCardSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  playerCard: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  playerCardTeam: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  jerseyNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
  },
  playerCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pcStat: {
    alignItems: 'center',
  },
  pcStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  pcStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  achievementsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  achievementsList: {
    flexDirection: 'row',
    gap: 10,
  },
  achievementBadge: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
