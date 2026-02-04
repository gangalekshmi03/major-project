import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from "react";

export default function MatchesScreen() {
  const [filter, setFilter] = useState('all');

  const matches = [
    {
      id: 1,
      date: 'Jan 28, 2024',
      time: '3:00 PM',
      opponent: 'City United',
      location: 'Central Stadium',
      result: 'Won 3-2',
      status: 'completed',
      yourGoals: 1,
      attendance: 'You played',
    },
    {
      id: 2,
      date: 'Feb 3, 2024',
      time: '6:30 PM',
      opponent: 'Valley FC',
      location: 'Home Ground',
      result: null,
      status: 'upcoming',
      attendance: 'Confirmed',
    },
    {
      id: 3,
      date: 'Feb 10, 2024',
      time: '7:00 PM',
      opponent: 'Park Rangers',
      location: 'Away',
      result: 'Lost 1-2',
      status: 'completed',
      yourGoals: 0,
      attendance: 'You played',
    },
  ];

  const filteredMatches = matches.filter(m => {
    if (filter === 'upcoming') return m.status === 'upcoming';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.matchCard,
        item.status === 'completed' ? styles.completedCard : styles.upcomingCard,
      ]}
    >
      <View style={styles.matchHeader}>
        <View>
          <Text style={styles.matchDate}>{item.date}</Text>
          <Text style={styles.matchTime}>{item.time}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'completed'
              ? styles.completedBadge
              : styles.upcomingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'completed'
                ? styles.completedText
                : styles.upcomingText,
            ]}
          >
            {item.status === 'completed' ? 'Completed' : 'Upcoming'}
          </Text>
        </View>
      </View>

      <View style={styles.matchContent}>
        <View style={styles.matchTeam}>
          <MaterialCommunityIcons name="soccer" size={24} color="#333" />
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.opponent}</Text>
            <Text style={styles.location}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#999" />
              {' '}{item.location}
            </Text>
          </View>
        </View>

        {item.status === 'completed' ? (
          <View style={styles.result}>
            <Text style={[styles.resultText, { color: item.result.includes('Won') ? '#4ECDC4' : '#FF6B6B' }]}>
              {item.result}
            </Text>
            {item.yourGoals !== undefined && (
              <Text style={styles.goalsText}>Your Goals: {item.yourGoals}</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.joinBtn}>
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <Text style={styles.joinBtnText}>{item.attendance}</Text>
          </TouchableOpacity>
        )}
      </View>

      {item.status === 'completed' && (
        <View style={styles.uploadVideo}>
          <MaterialCommunityIcons name="video-plus" size={16} color="#4ECDC4" />
          <Text style={styles.uploadText}>Upload Video</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      <View style={styles.filterBar}>
        {['all', 'upcoming', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />

      <TouchableOpacity style={styles.createBtn}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
        <Text style={styles.createBtnText}>Create Match</Text>
      </TouchableOpacity>
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  completedCard: {
    borderLeftColor: '#4ECDC4',
  },
  upcomingCard: {
    borderLeftColor: '#FF6B6B',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  matchTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: '#E8FFFA',
  },
  upcomingBadge: {
    backgroundColor: '#FFE9E9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedText: {
    color: '#4ECDC4',
  },
  upcomingText: {
    color: '#FF6B6B',
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchTeam: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
  result: {
    alignItems: 'flex-end',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalsText: {
    fontSize: 11,
    color: '#999',
  },
  joinBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
  },
  joinBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadVideo: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
