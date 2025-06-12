import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  Switch,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { useAppContext } from "../../context/AppContext";
import { useSpeed } from "../../hooks/useSpeed";
// import { saveSession } from "../../utils/helpers";

export default function HomeScreen() {
  const {
    isTracking,
    setIsTracking,
    speed,
    setSpeed,
    addSession,
    clearHistory,
    topSpeed,
    setTopSpeed,
  } = useAppContext();
  const [unit, setUnit] = useState<"kmh" | "ms">("kmh");
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastSpeed, setLastSpeed] = useState(0);
  // const [topSpeed, setTopSpeed] = useState(0); // NEW

  useSpeed();

  useEffect(() => {
    const loadTopSpeed = async () => {
      const stored = await AsyncStorage.getItem("topSpeed");
      if (stored) setTopSpeed(parseFloat(stored));
    };
    loadTopSpeed();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isTracking) {
      if (!startTime) setStartTime(Date.now());
      timer = setInterval(() => {
        setElapsedTime((Date.now() - (startTime || Date.now())) / 1000);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTracking, startTime]);

  useEffect(() => {
    if (!isTracking || speed <= 0 || isNaN(speed)) return;

    const avgSpeed = (speed + lastSpeed) / 2;
    const avg = isNaN(avgSpeed) ? 0 : avgSpeed;
    const increment = avg / 3600;
    setDistance((prev) => (isNaN(prev + increment) ? prev : prev + increment));
    setLastSpeed(speed);

    if (speed > topSpeed) {
      setTopSpeed(speed);
      AsyncStorage.setItem("topSpeed", String(speed));
    }
  }, [speed, topSpeed]);

  const safeSpeed =
    typeof speed === "number" && !isNaN(speed) && speed >= 0 ? speed : 0;
  const convertedSpeedRaw = unit === "kmh" ? safeSpeed : safeSpeed / 3.6;
  const convertedSpeed = isNaN(convertedSpeedRaw) ? 0 : convertedSpeedRaw;
  const convertedTopSpeed = unit === "kmh" ? topSpeed : topSpeed / 3.6;



  const speedAnim = useSharedValue(0);
  useEffect(() => {
    speedAnim.value = withSpring(convertedSpeed);
  }, [convertedSpeed]);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const rotate = interpolate(speedAnim.value, [0, 120], [-90, 90]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const toggleTracking = async () => {
    if (isTracking) {
      setIsTracking(false);
      await addSession({
        date: new Date().toISOString(),
        distance,
        elapsedTime,
        avgSpeed: distance / (elapsedTime / 3600),
      });
    } else {
      setDistance(0);
      setElapsedTime(0);
      setLastSpeed(0);
      setStartTime(Date.now());
      setIsTracking(true);
    }
  };

  const resetValues = async () => {
    setIsTracking(false);
    setSpeed(0);
    setDistance(0);
    setElapsedTime(0);
    setLastSpeed(0);
    //clear top speed as well
    await AsyncStorage.removeItem("topSpeed");
    await clearHistory();
    setTopSpeed(0);
  };

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${min}m ${s}s`;
  };

  const getFormattedDistance = () => {
    const dist = isNaN(distance) ? 0 : distance;
    return `${dist.toFixed(2)} km (${(dist * 1000).toFixed(0)} m)`;
  };

  const classifyMotion = (
    speed: number
  ): "Idle" | "Walking" | "Running" | "Vehicle" => {
    if (speed < 1) return "Idle";
    if (speed < 2.5) return "Walking";
    if (speed < 6) return "Running";
    return "Vehicle";
  };

  const motionType = classifyMotion(convertedSpeed);
  const { width } = Dimensions.get("window");

  return (
    <View className="flex-1 justify-center items-center bg-white space-y-6">
      <View className="absolute top-0 left-0 right-0">
        <Svg height="240" width={width} viewBox={`0 0 ${width} 240`}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#bbf7d0" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#86efac" stopOpacity="0.3" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={`
              M0,0 
              L0,180 
              Q${width / 2},240 ${width},180 
              L${width},0 
              Z
            `}
            fill="url(#grad)"
          />
        </Svg>
      </View>

      <View className="w-64 h-32 justify-end items-center overflow-hidden relative">
        <View className="absolute top-0 left-0 w-64 h-64 items-center justify-center">
          <View className="absolute w-64 h-64 rounded-full border-[10px] border-green-500 border-b-transparent rotate-[-90deg]" />
          <View className="absolute w-64 h-64 rounded-full border-[10px] border-yellow-500 border-b-transparent rotate-[-30deg]" />
          <View className="absolute w-64 h-64 rounded-full border-[10px] border-red-500 border-b-transparent rotate-[30deg]" />
        </View>

        <Animated.View
          style={[
            {
              width: 4,
              height: 80,
              backgroundColor:
                convertedSpeed < 20
                  ? "green"
                  : convertedSpeed < 60
                  ? "orange"
                  : "red",
              position: "absolute",
              bottom: 0,
              transformOrigin: "bottom center",
            },
            animatedStyle,
          ]}
        />
      </View>

      <View className="absolute top-[170px] w-[256px] flex-row justify-between px-2">
        <Text className="text-xs text-gray-500">0</Text>
        <Text className="text-xs text-gray-500">30</Text>
        <Text className="text-xs text-gray-500">60</Text>
        <Text className="text-xs text-gray-500">90</Text>
        <Text className="text-xs text-gray-500">120</Text>
      </View>

      <Text className="text-xl mt-24">Motion: {motionType}</Text>

      <Animated.Text
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(600)}
        className="text-6xl font-bold text-green-600 my-2"
      >
        {convertedSpeed.toFixed(1)} {unit === "kmh" ? "km/h" : "m/s"}
      </Animated.Text>

      {/* New: Top Speed */}
      <Text className="text-lg text-gray-600">
        🏁 Top: {convertedTopSpeed.toFixed(1)} {unit === "kmh" ? "km/h" : "m/s"}
      </Text>

      {/* New: Deviation */}
      <Text className="text-md text-blue-600">
        <Text
          style={{
            color: convertedSpeed > convertedTopSpeed ? "green" : "blue",
          }}
        >
          {convertedSpeed > convertedTopSpeed ? "🔺" : "🔻"}
        </Text>{" "}
        Deviation:{" "}
        {convertedTopSpeed > 0
          ? (
              (Math.abs(convertedTopSpeed - convertedSpeed) /
                convertedTopSpeed) *
              100
            ).toFixed(1)
          : "0"}
        % {convertedSpeed > convertedTopSpeed ? "above" : "below"} top
      </Text>

      <Text className="text-xl">Distance: {getFormattedDistance()}</Text>
      <Text className="text-xl">Time: {formatTime(elapsedTime)}</Text>

      <View className="flex-row items-center gap-2 mt-4">
        <Text className="text-sm">km/h</Text>
        <Switch
          value={unit === "ms"}
          onValueChange={() => {
            setUnit(unit === "kmh" ? "ms" : "kmh");
          }}
        />
        <Text className="text-sm">m/s</Text>
      </View>

      <Pressable
        className="bg-green-600 px-6 py-3 rounded-full mt-6"
        onPress={toggleTracking}
      >
        <Text className="text-white text-lg font-semibold">
          {isTracking ? "Stop" : "Start"} Tracking
        </Text>
      </Pressable>

      <Pressable
        className="border border-red-500 mt-4 px-4 py-2 rounded-full"
        onPress={resetValues}
      >
        <Text className="text-red-500">Reset</Text>
      </Pressable>
    </View>
  );
}
