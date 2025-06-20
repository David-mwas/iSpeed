// App.tsx (entry point)
import { AppProvider } from "../../context/AppContext";
// import HomeScreen from "../screens/HomeScreen";
// import StatsScreen from "./screens/StatsScreen";
// import HistoryScreen from "./screens/HistoryScreen";
// import SettingsScreen from "./screens/SettingsScreen";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={({ route }) => ({
          animation: "shift",
          tabBarIcon: ({ color, size }) => {
            let iconName = "";
            if (route.name === "index") iconName = "speedometer-outline";
            if (route.name === "stats") iconName = "stats-chart-outline";
            if (route.name === "history") iconName = "time-outline";
            if (route.name === "settings") iconName = "settings-outline";
            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: "#00C853",
          tabBarInactiveTintColor: "gray",
          // headerShown: false,
        })}
      >
        <Tabs.Screen name="index" options={{ headerShown: false }} />
        <Tabs.Screen name="stats" options={{ headerTitle: "📊 Statistics" }} />
        <Tabs.Screen name="settings" />
      </Tabs>
    </AppProvider>
  );
}

// Screens, context, hooks, and utilities will be scaffolded in:
// /screens/HomeScreen.tsx
// /screens/StatsScreen.tsx
// /screens/HistoryScreen.tsx
// /screens/SettingsScreen.tsx
// /context/AppContext.tsx
// /hooks/useSpeed.ts
// /utils/helpers.ts
// /components/SpeedDisplay.tsx
// /components/StreakProgress.tsx
