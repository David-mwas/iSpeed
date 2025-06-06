import * as Location from "expo-location";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export function useSpeed() {
  const { setSpeed } = useAppContext();

  useEffect(() => {
    let subscriber: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);
      if (status !== "granted") return;

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (location) => {
          console.log("Location update:", location);
          const currentSpeed = location.coords.speed ?? 0;
          setSpeed(currentSpeed >= 0 ? currentSpeed : 0);
        }
      );
    };

    startTracking();

    return () => {
      subscriber?.remove();
    };
  }, []);
}
