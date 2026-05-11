import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  goal: string;
  bodyType: string;
  weight: number;
  height: number;
  age: number;
}

export interface TodayStats {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  water: number;
  waterGoal: number;
  streak: number;
  workoutsCompleted: number;
  bodyScore: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface WeightEntry {
  date: string;
  weight: number;
}

interface AppContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => Promise<void>;
  userProfile: UserProfile;
  updateUserProfile: (p: Partial<UserProfile>) => void;
  todayStats: TodayStats;
  updateTodayStats: (s: Partial<TodayStats>) => void;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  meals: Meal[];
  addMeal: (m: Meal) => void;
  weightLog: WeightEntry[];
  addWeightEntry: (e: WeightEntry) => void;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  name: "Alex",
  goal: "Muscle Gain",
  bodyType: "Ectomorph",
  weight: 70,
  height: 175,
  age: 25,
};

const defaultStats: TodayStats = {
  calories: 1240,
  caloriesGoal: 2400,
  protein: 86,
  proteinGoal: 160,
  carbs: 142,
  carbsGoal: 240,
  fat: 38,
  fatGoal: 70,
  water: 5,
  waterGoal: 8,
  streak: 7,
  workoutsCompleted: 1,
  bodyScore: 72,
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingState] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [todayStats, setTodayStats] = useState<TodayStats>(defaultStats);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey! I'm your FitMorph AI coach. Ready to crush your goals today? Ask me anything about workouts, nutrition, or your transformation plan.",
      timestamp: Date.now() - 60000,
    },
  ]);
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", name: "Oatmeal with Protein", calories: 380, protein: 32, carbs: 48, fat: 8, time: Date.now() - 14400000, mealType: "breakfast" },
    { id: "2", name: "Chicken Rice Bowl", calories: 520, protein: 42, carbs: 58, fat: 12, time: Date.now() - 7200000, mealType: "lunch" },
    { id: "3", name: "Greek Yogurt", calories: 180, protein: 18, carbs: 20, fat: 3, time: Date.now() - 3600000, mealType: "snack" },
  ]);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([
    { date: "2026-05-03", weight: 72.1 },
    { date: "2026-05-04", weight: 71.8 },
    { date: "2026-05-05", weight: 71.5 },
    { date: "2026-05-06", weight: 71.3 },
    { date: "2026-05-07", weight: 71.0 },
    { date: "2026-05-08", weight: 70.8 },
    { date: "2026-05-09", weight: 70.5 },
    { date: "2026-05-10", weight: 70.2 },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ob, profile, stats] = await Promise.all([
          AsyncStorage.getItem("onboardingComplete"),
          AsyncStorage.getItem("userProfile"),
          AsyncStorage.getItem("todayStats"),
        ]);
        if (ob === "true") setOnboardingState(true);
        if (profile) setUserProfile(JSON.parse(profile));
        if (stats) setTodayStats(JSON.parse(stats));
      } catch {}
      setIsLoading(false);
    };
    loadData();
  }, []);

  const setOnboardingComplete = useCallback(async (v: boolean) => {
    setOnboardingState(v);
    await AsyncStorage.setItem("onboardingComplete", v ? "true" : "false");
  }, []);

  const updateUserProfile = useCallback((p: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...p };
      AsyncStorage.setItem("userProfile", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateTodayStats = useCallback((s: Partial<TodayStats>) => {
    setTodayStats((prev) => {
      const next = { ...prev, ...s };
      AsyncStorage.setItem("todayStats", JSON.stringify(next));
      return next;
    });
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const addMeal = useCallback((m: Meal) => {
    setMeals((prev) => {
      const next = [...prev, m];
      return next;
    });
    setTodayStats((prev) => ({
      ...prev,
      calories: prev.calories + m.calories,
      protein: prev.protein + m.protein,
      carbs: prev.carbs + m.carbs,
      fat: prev.fat + m.fat,
    }));
  }, []);

  const addWeightEntry = useCallback((e: WeightEntry) => {
    setWeightLog((prev) => [...prev, e]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        setOnboardingComplete,
        userProfile,
        updateUserProfile,
        todayStats,
        updateTodayStats,
        messages,
        addMessage,
        meals,
        addMeal,
        weightLog,
        addWeightEntry,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
