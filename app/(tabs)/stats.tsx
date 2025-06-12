import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/AppContext";

export default function StatsScreen() {
  const { topSpeed, unit, history } = useAppContext();
  //   const [history, sethistory] = useState<any[]>([]);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (history) {
        const totalDist = history.reduce(
          (sum: number, s: any) => sum + (s.distance || 0),
          0
        );
        const totalT = history.reduce(
          (sum: number, s: any) => sum + (s.elapsedTime || 0),
          0
        );
        const avgSpeedCalc = totalT > 0 ? totalDist / (totalT / 3600) : 0;

        setTotalDistance(totalDist);
        setTotalTime(totalT);
        setAverageSpeed(avgSpeedCalc);

        // Streak: Count how many consecutive days you've recorded a session
        const dates = history.map((s: any) => s.date.split("T")[0]);
        const uniqueDates = Array.from(new Set(dates)).sort().reverse();
        let streakCount = 0;
        let today = new Date();

        for (const date of uniqueDates) {
          const dateObj = new Date(date as string);
          const diff =
            (today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 0 || diff === streakCount) {
            streakCount++;
            today.setDate(today.getDate() - 1);
          } else {
            break;
          }
        }
        setStreak(streakCount);
      }
    };
    loadData();
  }, [history]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
  };
console.log("topSpeed", topSpeed);
  const formatSpeed = (s: number) =>
    unit === "kmh" ? `${s.toFixed(2)} km/h` : `${(s / 3.6).toFixed(2)} m/s`;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Top Speed</Text>
          <Text style={styles.value}>{formatSpeed(topSpeed)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Average Speed</Text>
          <Text style={styles.value}>{formatSpeed(averageSpeed)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total Distance</Text>
          <Text style={styles.value}>{totalDistance.toFixed(2)} km</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total Time</Text>
          <Text style={styles.value}>{formatTime(totalTime)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>🔥 Streak</Text>
          <Text style={styles.value}>{streak} day(s)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>sessions</Text>
          {history.length === 0 ? (
            <Text>No history recorded.</Text>
          ) : (
            history.map((s, index) => (
              <View key={index} style={{ marginVertical: 4 }}>
                <Text style={{ fontSize: 12 }}>
                  📅 {new Date(s.date).toLocaleDateString()} | 🚴‍♂️{" "}
                  {s.distance.toFixed(2)} km | ⏱️ {formatTime(s.elapsedTime)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
