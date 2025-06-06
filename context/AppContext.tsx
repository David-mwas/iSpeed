// context/AppContext.tsx
import React, { createContext, useContext, useState } from "react";

type AppContextType = {
  isTracking: boolean;
  setIsTracking: (val: boolean) => void;
  speed: number;
  setSpeed: (val: number) => void;
};

const AppContext = createContext<AppContextType>({
  isTracking: false,
  setIsTracking: () => {},
  speed: 0,
  setSpeed: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);

  return (
    <AppContext.Provider value={{ isTracking, setIsTracking, speed, setSpeed }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
