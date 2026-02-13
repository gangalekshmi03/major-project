import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "@/context/useAuth";
import {
  addMatchParticipant,
  createMatch,
  getAllMatches,
  getMatchParticipants,
  joinMatch,
  MatchItem,
  MatchParticipant,
  leaveMatch,
  removeMatchParticipant,
} from "@/api/matches";
import { AppUser, listUsers } from "@/api/users";

type FilterType = "all" | "upcoming" | "completed" | "my";

type CreateMatchForm = {
  title: string;
  date: string;
  time: string;
  location: string;
  match_type: string;
  max_players: string;
  description: string;
};

const DEFAULT_FORM: CreateMatchForm = {
  title: "",
  date: "",
  time: "",
  location: "",
  match_type: "friendly",
  max_players: "22",
  description: "",
};

export default function MatchesScreen() {
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>("all");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateMatchForm>(DEFAULT_FORM);

  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [managingParticipant, setManagingParticipant] = useState(false);

  const myUserId = user?.id ?? "";

  const loadMatches = useCallback(
    async (useRefresh: boolean = false) => {
      if (useRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await getAllMatches(filter, 100, 1);
        if (response?.status === "success" && Array.isArray(response.matches)) {
          setMatches(response.matches);
        } else {
          Alert.alert("Matches", response?.message || "Failed to load matches");
        }
      } catch (error: any) {
        Alert.alert("Matches", error?.response?.data?.message || "Failed to load matches");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const refreshMatches = async () => {
    await loadMatches(true);
  };

  const summary = useMemo(() => {
    const upcoming = matches.filter((m) => m.status === "upcoming").length;
    const completed = matches.filter((m) => m.status === "completed").length;
    return {
      total: matches.length,
      upcoming,
      completed,
    };
  }, [matches]);

  const openParticipants = async (matchItem: MatchItem) => {
    setSelectedMatch(matchItem);
    setParticipantsModalVisible(true);
    setParticipantsLoading(true);
    if (matchItem.organizer_id === myUserId) {
      setUsersLoading(true);
    }

    try {
      const response = await getMatchParticipants(matchItem._id);
      if (response?.status === "success" && Array.isArray(response.participants)) {
        setParticipants(response.participants);
      } else {
        setParticipants([]);
        Alert.alert("Players", response?.message || "Failed to load participants");
      }
    } catch (error: any) {
      setParticipants([]);
      Alert.alert("Players", error?.response?.data?.message || "Failed to load participants");
    } finally {
      setParticipantsLoading(false);
    }

    if (matchItem.organizer_id === myUserId) {
      try {
        const usersResponse = await listUsers(0, 200);
        if (usersResponse?.status === "success" && Array.isArray(usersResponse.users)) {
          setRegisteredUsers(usersResponse.users);
        } else {
          setRegisteredUsers([]);
        }
      } catch (error) {
        setRegisteredUsers([]);
      } finally {
        setUsersLoading(false);
      }
    } else {
      setRegisteredUsers([]);
      setUsersLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      Alert.alert("Create Match", "Please fill title, date, time and location");
      return;
    }

    setCreating(true);
    try {
      const response = await createMatch({
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        match_type: form.match_type,
        max_players: Number(form.max_players) || 22,
        description: form.description,
      });

      if (response?.status === "success") {
        setCreateModalVisible(false);
        setForm(DEFAULT_FORM);
        await loadMatches();
      } else {
        Alert.alert("Create Match", response?.message || "Could not create match");
      }
    } catch (error: any) {
      Alert.alert("Create Match", error?.response?.data?.message || "Could not create match");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    try {
      const response = await joinMatch(matchId);
      if (response?.status === "success") {
        await loadMatches();
      } else {
        Alert.alert("Join Match", response?.message || "Unable to join match");
      }
    } catch (error: any) {
      Alert.alert("Join Match", error?.response?.data?.message || "Unable to join match");
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    try {
      const response = await leaveMatch(matchId);
      if (response?.status === "success") {
        await loadMatches();
      } else {
        Alert.alert("Leave Match", response?.message || "Unable to leave match");
      }
    } catch (error: any) {
      Alert.alert("Leave Match", error?.response?.data?.message || "Unable to leave match");
    }
  };

  const handleAddParticipant = async (userId: string) => {
    if (!selectedMatch || !userId.trim()) {
      return;
    }

    setManagingParticipant(true);
    try {
      const response = await addMatchParticipant(selectedMatch._id, userId.trim());
      if (response?.status === "success") {
        await openParticipants(selectedMatch);
        await loadMatches();
      } else {
        Alert.alert("Add Player", response?.message || "Could not add player");
      }
    } catch (error: any) {
      Alert.alert("Add Player", error?.response?.data?.message || "Could not add player");
    } finally {
      setManagingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedMatch) {
      return;
    }

    setManagingParticipant(true);
    try {
      const response = await removeMatchParticipant(selectedMatch._id, participantId);
      if (response?.status === "success") {
        await openParticipants(selectedMatch);
        await loadMatches();
      } else {
        Alert.alert("Remove Player", response?.message || "Could not remove player");
      }
    } catch (error: any) {
      Alert.alert("Remove Player", error?.response?.data?.message || "Could not remove player");
    } finally {
      setManagingParticipant(false);
    }
  };

  const renderActionButton = (matchItem: MatchItem) => {
    const participants = matchItem.participants || [];
    const isOrganizer = matchItem.organizer_id === myUserId;
    const hasJoined = participants.includes(myUserId);
    const isCompleted = matchItem.status === "completed";
    const isFull = participants.length >= matchItem.max_players;

    if (isOrganizer) {
      return (
        <View style={[styles.actionButton, styles.organizerBadge]}>
          <MaterialCommunityIcons name="star" size={14} color="#fff" />
          <Text style={styles.actionText}>Organizer</Text>
        </View>
      );
    }

    if (isCompleted) {
      return (
        <View style={[styles.actionButton, styles.completedBadge]}>
          <Text style={styles.actionText}>Closed</Text>
        </View>
      );
    }

    if (hasJoined) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.leaveButton]}
          onPress={() => handleLeaveMatch(matchItem._id)}
        >
          <MaterialCommunityIcons name="exit-run" size={14} color="#fff" />
          <Text style={styles.actionText}>Leave</Text>
        </TouchableOpacity>
      );
    }

    if (isFull) {
      return (
        <View style={[styles.actionButton, styles.completedBadge]}>
          <Text style={styles.actionText}>Full</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.actionButton, styles.joinButton]}
        onPress={() => handleJoinMatch(matchItem._id)}
      >
        <MaterialCommunityIcons name="account-plus" size={14} color="#fff" />
        <Text style={styles.actionText}>Join</Text>
      </TouchableOpacity>
    );
  };

  const renderMatch = ({ item }: { item: MatchItem }) => {
    const statusColor =
      item.status === "completed" ? "#238b45" : item.status === "live" ? "#d9480f" : "#1f6feb";

    return (
      <TouchableOpacity style={styles.matchCard} onPress={() => openParticipants(item)}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="soccer-field" size={18} color="#1f6feb" />
            <Text style={styles.matchTitle}>{item.title}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusPillText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.date}</Text>
          <Text style={styles.metaText}>{item.time}</Text>
          <Text style={styles.metaText}>{item.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.typeTag}>{item.match_type}</Text>
          <Text style={styles.playersText}>
            {item.participant_count}/{item.max_players} players
          </Text>
        </View>

        <View style={styles.rowBetween}>
          {renderActionButton(item)}
          <TouchableOpacity
            style={styles.playersButton}
            onPress={() => openParticipants(item)}
          >
            <MaterialCommunityIcons name="account-group" size={14} color="#1f6feb" />
            <Text style={styles.playersButtonText}>Players</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const isSelectedMatchOrganizer = selectedMatch?.organizer_id === myUserId;
  const selectedParticipantIds = useMemo(
    () => new Set(participants.map((participant) => participant._id)),
    [participants]
  );
  const availableUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    return registeredUsers
      .filter((registeredUser) => !selectedParticipantIds.has(registeredUser.id))
      .filter((registeredUser) => {
        if (!keyword) {
          return true;
        }
        const fullName = (registeredUser.full_name || "").toLowerCase();
        const username = (registeredUser.username || "").toLowerCase();
        const email = (registeredUser.email || "").toLowerCase();
        return (
          fullName.includes(keyword) || username.includes(keyword) || email.includes(keyword)
        );
      });
  }, [registeredUsers, selectedParticipantIds, userSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Real Matches</Text>
          <Text style={styles.subtitle}>Create, join and track your football games</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryWrap}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{summary.upcoming}</Text>
          <Text style={styles.summaryLabel}>Upcoming</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{summary.completed}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(["all", "upcoming", "completed", "my"] as const).map((option) => {
          const active = filter === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(option)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {option === "my" ? "My Matches" : option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1f6feb" />
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item._id}
          renderItem={renderMatch}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshMatches} tintColor="#1f6feb" />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="calendar-blank" size={30} color="#7f8ea3" />
              <Text style={styles.emptyText}>No matches found for this filter.</Text>
            </View>
          }
        />
      )}

      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Match</Text>
            <TextInput
              style={styles.input}
              placeholder="Title (e.g. Sunday 7v7)"
              value={form.title}
              onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={form.date}
              onChangeText={(value) => setForm((prev) => ({ ...prev, date: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM)"
              value={form.time}
              onChangeText={(value) => setForm((prev) => ({ ...prev, time: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={form.location}
              onChangeText={(value) => setForm((prev) => ({ ...prev, location: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Match Type (friendly/tournament/training)"
              value={form.match_type}
              onChangeText={(value) => setForm((prev) => ({ ...prev, match_type: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Players"
              keyboardType="number-pad"
              value={form.max_players}
              onChangeText={(value) => setForm((prev) => ({ ...prev, max_players: value }))}
            />
            <TextInput
              style={[styles.input, styles.multiInput]}
              placeholder="Description (optional)"
              multiline
              value={form.description}
              onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.confirmButton]}
                onPress={handleCreateMatch}
                disabled={creating}
              >
                <Text style={styles.confirmText}>{creating ? "Creating..." : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={participantsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setParticipantsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Players</Text>
            <Text style={styles.modalSubtitle}>{selectedMatch?.title ?? "Match"}</Text>
            <Text style={styles.sectionTitle}>Added Players ({participants.length})</Text>

            {participantsLoading ? (
              <ActivityIndicator size="small" color="#1f6feb" />
            ) : (
              <FlatList
                data={participants}
                keyExtractor={(item) => item._id}
                style={styles.participantsList}
                renderItem={({ item }) => {
                  const canRemove =
                    isSelectedMatchOrganizer && item._id !== selectedMatch?.organizer_id;
                  return (
                    <View style={styles.participantRow}>
                      <View style={styles.row}>
                        <MaterialCommunityIcons name="account-circle" size={18} color="#4e5d78" />
                        <Text style={styles.participantName}>
                          {item.full_name || item.username || item.email || item._id}
                        </Text>
                      </View>
                      {canRemove ? (
                        <TouchableOpacity
                          onPress={() => handleRemoveParticipant(item._id)}
                          disabled={managingParticipant}
                        >
                          <MaterialCommunityIcons name="account-remove" size={18} color="#d9480f" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                }}
              />
            )}

            {isSelectedMatchOrganizer ? (
              <View style={styles.manageWrap}>
                <Text style={styles.sectionTitle}>Add Players</Text>
                <Text style={styles.manageLabel}>Add players from registered users</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Search by name / username / email"
                  value={userSearch}
                  onChangeText={setUserSearch}
                />
                {usersLoading ? (
                  <ActivityIndicator style={styles.usersLoader} size="small" color="#1f6feb" />
                ) : (
                  <FlatList
                    data={availableUsers}
                    keyExtractor={(item) => item.id}
                    style={styles.usersList}
                    ListEmptyComponent={
                      <Text style={styles.noUsersText}>No available users to add.</Text>
                    }
                    renderItem={({ item }) => (
                      <View style={styles.availableUserRow}>
                        <View>
                          <Text style={styles.availableUserName}>
                            {item.full_name || item.username || item.email || item.id}
                          </Text>
                          <Text style={styles.availableUserId}>ID: {item.id}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.modalActionButton, styles.confirmButton]}
                          onPress={() => handleAddParticipant(item.id)}
                          disabled={managingParticipant}
                        >
                          <Text style={styles.confirmText}>
                            {managingParticipant ? "Saving..." : "Add"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.helperText}>Only the match organizer can add/remove players.</Text>
            )}

            <TouchableOpacity
              style={[styles.modalActionButton, styles.cancelButton, styles.closeButton]}
              onPress={() => setParticipantsModalVisible(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1f6feb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  summaryWrap: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbe5f2",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f6feb",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#60738b",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#c5d3e4",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#1f6feb",
    borderColor: "#1f6feb",
  },
  filterChipText: {
    fontSize: 12,
    color: "#3f4d61",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dbe5f2",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 12,
    color: "#4e5d78",
  },
  typeTag: {
    fontSize: 11,
    color: "#1f6feb",
    backgroundColor: "#e7f0ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  playersText: {
    fontSize: 12,
    color: "#3f4d61",
    fontWeight: "600",
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  joinButton: {
    backgroundColor: "#0f9d58",
  },
  leaveButton: {
    backgroundColor: "#d9480f",
  },
  completedBadge: {
    backgroundColor: "#6b7280",
  },
  organizerBadge: {
    backgroundColor: "#1f6feb",
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  playersButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f6feb",
    backgroundColor: "#f4f8ff",
  },
  playersButtonText: {
    fontSize: 12,
    color: "#1f6feb",
    fontWeight: "700",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    gap: 8,
  },
  emptyText: {
    color: "#60738b",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#60738b",
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c5d3e4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 10,
    fontSize: 13,
    color: "#0f172a",
    backgroundColor: "#f8fbff",
  },
  multiInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  modalActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#e2e8f0",
  },
  confirmButton: {
    backgroundColor: "#1f6feb",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  participantsList: {
    maxHeight: 240,
  },
  participantRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  participantName: {
    fontSize: 13,
    color: "#0f172a",
    maxWidth: "90%",
  },
  manageWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eef3f9",
    paddingTop: 12,
  },
  manageLabel: {
    fontSize: 12,
    color: "#60738b",
    fontWeight: "600",
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: "#60738b",
  },
  usersLoader: {
    marginTop: 12,
  },
  usersList: {
    marginTop: 10,
    maxHeight: 220,
  },
  availableUserRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  availableUserName: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
    maxWidth: 190,
  },
  availableUserId: {
    fontSize: 11,
    color: "#60738b",
    marginTop: 2,
    maxWidth: 190,
  },
  noUsersText: {
    fontSize: 12,
    color: "#60738b",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
});
