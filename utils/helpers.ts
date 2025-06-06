import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "tracking_history";

export async function saveSession(session: any) {
  const history = await getHistory();
  history.push(session);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function getHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
