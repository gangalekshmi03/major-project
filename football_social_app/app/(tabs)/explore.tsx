import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  badge: string;
};

type Team = {
  id: number;
  name: string;
  members: number;
  wins: number;
  icon: string;
};

type Player = {
  id: number;
  name: string;
  position: string;
  rating: number;
  goals: number;
  avatar: string;
};

type LeaderboardRow = {
  rank: number;
  name: string;
  rating: number;
  wins: number;
};

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('coaches');

  const categories = ['Coaches', 'Teams', 'Players', 'Leaderboards'];

  const coaches: Coach[] = [
    {
      id: 1,
      name: 'John Smith',
      specialty: 'Striker Coaching',
      rating: 4.8,
      reviews: 234,
      hourlyRate: '$50/hr',
      badge: '⭐',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      specialty: 'Midfield Tactics',
      rating: 4.9,
      reviews: 156,
      hourlyRate: '$45/hr',
      badge: '🏆',
    },
    {
      id: 3,
      name: 'David Lee',
      specialty: 'Defensive Play',
      rating: 4.7,
      reviews: 189,
      hourlyRate: '$55/hr',
      badge: '⭐',
    },
  ];

  const teams: Team[] = [
    {
      id: 1,
      name: 'City Strikers',
      members: 15,
      wins: 8,
      icon: '⚽',
    },
    {
      id: 2,
      name: 'Valley United',
      members: 22,
      wins: 12,
      icon: '⚽',
    },
    {
      id: 3,
      name: 'Park Rangers',
      members: 18,
      wins: 10,
      icon: '⚽',
    },
  ];

  const players: Player[] = [
    {
      id: 1,
      name: 'Alex Johnson',
      position: 'Midfielder',
      rating: 8.7,
      goals: 24,
      avatar: '👨‍🦱',
    },
    {
      id: 2,
      name: 'Emma Davis',
      position: 'Forward',
      rating: 9.1,
      goals: 42,
      avatar: '👩',
    },
    {
      id: 3,
      name: 'Marcus Chen',
      position: 'Goalkeeper',
      rating: 8.4,
      goals: 0,
      avatar: '👨‍🦲',
    },
  ];

  const leaderboard: LeaderboardRow[] = [
    { rank: 1, name: 'Emma Davis', rating: 9.1, wins: 34 },
    { rank: 2, name: 'Alex Johnson', rating: 8.7, wins: 28 },
    { rank: 3, name: 'Sarah Williams', rating: 8.6, wins: 25 },
    { rank: 4, name: 'Marcus Chen', rating: 8.4, wins: 22 },
    { rank: 5, name: 'James Wilson', rating: 8.2, wins: 19 },
  ];

  const renderCoach = ({ item }: { item: Coach }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameSection}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.specialty}</Text>
        </View>
        <Text style={styles.badge}>{item.badge}</Text>
      </View>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="star" size={16} color="#FFB84D" />
          <Text style={styles.statText}>{item.rating} ({item.reviews})</Text>
        </View>
        <Text style={styles.rate}>{item.hourlyRate}</Text>
      </View>
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookBtnText}>Book Session</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.teamHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.teamStats}>
            <Text style={styles.teamStatText}>{item.members} members</Text>
            <Text style={styles.teamStatText}>•</Text>
            <Text style={styles.teamStatText}>{item.wins} wins</Text>
          </View>
        </View>
        <Text style={styles.teamIcon}>{item.icon}</Text>
      </View>
      <TouchableOpacity style={styles.joinBtn}>
        <MaterialCommunityIcons name="check" size={16} color="white" />
        <Text style={styles.joinBtnText}>Join Team</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.playerHeader}>
        <View style={styles.playerAvatar}>
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.position}</Text>
        </View>
      </View>
      <View style={styles.playerStats}>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatLabel}>Rating</Text>
          <Text style={styles.playerStatValue}>{item.rating}</Text>
        </View>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatLabel}>Goals</Text>
          <Text style={styles.playerStatValue}>{item.goals}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.followBtn}>
        <MaterialCommunityIcons name="account-plus" size={16} color="#4ECDC4" />
        <Text style={styles.followBtnText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLeaderboardRow = ({ item }: { item: LeaderboardRow }) => (
    <View style={styles.leaderboardRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>
      <View style={styles.playerNameColumn}>
        <Text style={styles.playerNameText}>{item.name}</Text>
      </View>
      <View style={styles.leaderboardStat}>
        <MaterialCommunityIcons name="star" size={14} color="#FFB84D" />
        <Text style={styles.leaderboardStatText}>{item.rating}</Text>
      </View>
      <View style={styles.leaderboardStat}>
        <MaterialCommunityIcons name="trophy" size={14} color="#4ECDC4" />
        <Text style={styles.leaderboardStatText}>{item.wins}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.toLowerCase() && styles.categoryBtnActive,
            ]}
            onPress={() => setSelectedCategory(cat.toLowerCase())}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.toLowerCase() && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory === 'coaches' && (
        <FlatList
          data={coaches}
          renderItem={renderCoach}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {selectedCategory === 'teams' && (
        <FlatList
          data={teams}
          renderItem={renderTeam}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {selectedCategory === 'players' && (
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {selectedCategory === 'leaderboards' && (
        <View style={styles.leaderboardContainer}>
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardRow}
            keyExtractor={(item) => item.rank.toString()}
            contentContainerStyle={styles.leaderboardContent}
            scrollEnabled={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  categoryBar: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  badge: {
    fontSize: 20,
    marginLeft: 8,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  rate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bookBtn: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  teamStatText: {
    fontSize: 12,
    color: '#999',
  },
  teamIcon: {
    fontSize: 32,
  },
  joinBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  joinBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  playerStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  playerStatLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  playerStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  followBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  followBtnText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardContent: {
    paddingVertical: 8,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  playerNameColumn: {
    flex: 1,
  },
  playerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  leaderboardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  leaderboardStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
