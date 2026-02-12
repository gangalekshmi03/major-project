import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PerformanceScreen() {
  const [screen, setScreen] = useState<'menu' | 'upload' | 'results'>('menu');
  const [videoUri, setVideoUri] = useState('');
  const [matchType, setMatchType] = useState('');
  const [position, setPosition] = useState('');
  const [matchDate, setMatchDate] = useState('');

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const matchTypes = ['Full Match', 'Highlights', 'Training', 'Tournament'];

  const handleUploadVideo = () => {
    if (!videoUri || !matchType) {
      Alert.alert('Error', 'Please select a video and match type');
      return;
    }
    setScreen('results');
  };

  const mockAnalysisResults = {
    speed: { max: '8.2 m/s', avg: '5.4 m/s' },
    distance: '4.3 km',
    sprints: 24,
    passes: { total: 45, successful: 41, accuracy: '91%' },
    shots: { total: 3, onTarget: 1 },
    possession: '48%',
    heatmap: 'Generated',
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'menu' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Performance Analysis</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('upload')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]}>
              <MaterialCommunityIcons name="upload" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Upload Video</Text>
              <Text style={styles.actionDesc}>Analyze your match performance</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('results')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4ECDC4' }]}>
              <MaterialCommunityIcons name="chart-line" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Results</Text>
              <Text style={styles.actionDesc}>Check previous analyses</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'upload' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('menu')}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Upload Video</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.uploadSection}>
            <View style={styles.uploadBox}>
              <MaterialCommunityIcons name="cloud-upload" size={48} color="#FF6B6B" />
              <Text style={styles.uploadText}>Tap to select video</Text>
              <Text style={styles.uploadSubtext}>MP4, MOV, or AVI</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setVideoUri('demo_video.mp4')}>
                <Text style={styles.selectBtnText}>Select Video</Text>
              </TouchableOpacity>
            </View>
          </View>

          {videoUri && (
            <View style={styles.selectedFile}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4ECDC4" />
              <Text style={styles.selectedFileName}>{videoUri}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Type *</Text>
              <FlatList
                data={matchTypes}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      matchType === item && styles.optionSelected,
                    ]}
                    onPress={() => setMatchType(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        matchType === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Position</Text>
              <FlatList
                data={positions}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      position === item && styles.optionSelected,
                    ]}
                    onPress={() => setPosition(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        position === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Match Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={matchDate}
                onChangeText={setMatchDate}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleUploadVideo}
          >
            <Text style={styles.submitBtnText}>Analyze Video</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'results' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('menu')}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Analysis Results</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.resultsSection}>
            <Text style={styles.resultDate}>{matchDate || '2024-01-20'}</Text>
            <Text style={styles.resultMatch}>{matchType || 'Full Match'}</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Max Speed</Text>
              <Text style={styles.metricValue}>{mockAnalysisResults.speed.max}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg Speed</Text>
              <Text style={styles.metricValue}>{mockAnalysisResults.speed.avg}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{mockAnalysisResults.distance}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Sprints</Text>
              <Text style={styles.metricValue}>{mockAnalysisResults.sprints}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Pass Statistics</Text>
            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Total Passes</Text>
              </View>
              <Text style={styles.detailValue}>{mockAnalysisResults.passes.total}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Successful</Text>
              </View>
              <Text style={styles.detailValue}>{mockAnalysisResults.passes.successful}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Accuracy</Text>
              </View>
              <Text style={styles.detailValue}>{mockAnalysisResults.passes.accuracy}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Shooting</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Shots</Text>
              <Text style={styles.detailValue}>{mockAnalysisResults.shots.total}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>On Target</Text>
              <Text style={styles.detailValue}>{mockAnalysisResults.shots.onTarget}</Text>
            </View>
          </View>

          <View style={styles.heatmapSection}>
            <View style={styles.heatmapPlaceholder}>
              <MaterialCommunityIcons name="map-outline" size={48} color="#ccc" />
              <Text style={styles.heatmapText}>Player Heatmap</Text>
              <Text style={styles.heatmapSubtext}>Shows movement zones</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.btn, styles.generateBtn]}>
              <MaterialCommunityIcons name="card-plus" size={20} color="white" />
              <Text style={styles.btnText}>Generate Player Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.coachBtn]}>
              <MaterialCommunityIcons name="brain" size={20} color="white" />
              <Text style={styles.btnText}>Send to AI Coach</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: "#999",
  },
  uploadSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#fff8f8",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  selectBtn: {
    marginTop: 16,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectBtnText: {
    color: "white",
    fontWeight: "600",
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f0f9f7",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  selectedFileName: {
    marginLeft: 8,
    color: "#4ECDC4",
    fontWeight: "500",
  },
  form: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "white",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#FF6B6B",
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "white",
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  resultMatch: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  detailsSection: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  heatmapSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heatmapPlaceholder: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  heatmapText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
  },
  heatmapSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  generateBtn: {
    backgroundColor: "#4ECDC4",
  },
  coachBtn: {
    backgroundColor: "#95E1D3",
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});
