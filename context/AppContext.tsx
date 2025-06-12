// context/AppContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UnitType = "kmh" | "ms";

interface SessionData {
  date: string;
  distance: number;
  elapsedTime: number;
  avgSpeed: number;
}

interface AppContextType {
  isTracking: boolean;
  setIsTracking: (val: boolean) => void;
  speed: number;
  setSpeed: (val: number) => void;
  unit: UnitType;
  setUnit: (val: UnitType) => void;
  topSpeed: number;
  setTopSpeed: (val: number) => void;
  history: SessionData[];
  addSession: (session: SessionData) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  isTracking: false,
  setIsTracking: () => {},
  speed: 0,
  setSpeed: () => {},
  unit: "kmh",
  setUnit: () => {},
  topSpeed: 0,
  setTopSpeed: () => {},
  history: [],
  addSession: async () => {},
  clearHistory: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [unit, setUnit] = useState<UnitType>("kmh");
  const [topSpeed, setTopSpeed] = useState(0);
  const [history, setHistory] = useState<SessionData[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const storedTop = await AsyncStorage.getItem("topSpeed");
      const storedUnit = await AsyncStorage.getItem("unit");
      const storedHistory = await AsyncStorage.getItem("history");

      if (storedTop) setTopSpeed(parseFloat(storedTop));
      if (storedUnit === "kmh" || storedUnit === "ms") setUnit(storedUnit);
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    };
    loadInitialData();
  }, []);

  const addSession = async (session: SessionData) => {
    console.log("Adding session:", session);
    // const updated = [...history, session];
    setHistory([...history, session]);
    await AsyncStorage.setItem(
      "history",
      JSON.stringify([...history, session])
    );
  };
  // get stored history from AsyncStorage
  // const getStoredHistory = async () => {
  //   const stored = await AsyncStorage.getItem("history");
  //   if (stored) setHistory(JSON.parse(stored));
  // };

  const clearHistory = async () => {
    setTopSpeed(0);
    await AsyncStorage.removeItem("topSpeed");

    setHistory([]);
    await AsyncStorage.removeItem("history");
  };

  

  return (
    <AppContext.Provider
      value={{
        isTracking,
        setIsTracking,
        speed,
        setSpeed,
        unit,
        setUnit,
        topSpeed,
        setTopSpeed,
        history,
        addSession,
        clearHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
