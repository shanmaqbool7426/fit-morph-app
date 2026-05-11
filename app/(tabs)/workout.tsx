import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WorkoutCard } from "@/components/WorkoutCard";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Strength", "HIIT", "Fat Loss", "Mobility", "Home"];

const WORKOUTS = [
  {
    id: "1",
    name: "Upper Body Power",
    category: "Strength",
    duration: 45,
    calories: 320,
    level: "Intermediate",
    accentColor: "#8B5CF6",
    exercises: [
      { name: "Push-ups", sets: 4, reps: 15 },
      { name: "Dumbbell Rows", sets: 4, reps: 12 },
      { name: "Shoulder Press", sets: 3, reps: 10 },
      { name: "Bicep Curls", sets: 3, reps: 12 },
      { name: "Tricep Dips", sets: 3, reps: 15 },
    ],
  },
  {
    id: "2",
    name: "Fat Burn HIIT",
    category: "HIIT",
    duration: 30,
    calories: 450,
    level: "Intermediate",
    accentColor: "#EF4444",
    exercises: [
      { name: "Burpees", sets: 4, duration: "40s" },
      { name: "Jump Squats", sets: 4, duration: "40s" },
      { name: "Mountain Climbers", sets: 4, duration: "40s" },
      { name: "High Knees", sets: 4, duration: "40s" },
    ],
  },
  {
    id: "3",
    name: "Lower Body Sculpt",
    category: "Strength",
    duration: 40,
    calories: 280,
    level: "Beginner",
    accentColor: "#EC4899",
    exercises: [
      { name: "Squats", sets: 4, reps: 15 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Glute Bridges", sets: 4, reps: 20 },
      { name: "Calf Raises", sets: 3, reps: 20 },
    ],
  },
  {
    id: "4",
    name: "Core & Abs",
    category: "Fat Loss",
    duration: 25,
    calories: 190,
    level: "Beginner",
    accentColor: "#10B981",
    exercises: [
      { name: "Plank", sets: 3, duration: "60s" },
      { name: "Crunches", sets: 4, reps: 20 },
      { name: "Leg Raises", sets: 3, reps: 15 },
      { name: "Russian Twists", sets: 3, reps: 20 },
    ],
  },
  {
    id: "5",
    name: "Mobility Flow",
    category: "Mobility",
    duration: 20,
    calories: 80,
    level: "All Levels",
    accentColor: "#06B6D4",
    exercises: [
      { name: "Cat-Cow Stretch", sets: 2, reps: 10 },
      { name: "Hip Flexor Stretch", sets: 2, duration: "30s" },
      { name: "Shoulder Rolls", sets: 2, reps: 10 },
      { name: "Pigeon Pose", sets: 2, duration: "45s" },
    ],
  },
  {
    id: "6",
    name: "Home Full Body",
    category: "Home",
    duration: 35,
    calories: 260,
    level: "Beginner",
    accentColor: "#F59E0B",
    exercises: [
      { name: "Jump Jacks", sets: 3, duration: "45s" },
      { name: "Push-ups", sets: 3, reps: 12 },
      { name: "Bodyweight Squats", sets: 3, reps: 15 },
      { name: "Superman", sets: 3, reps: 12 },
    ],
  },
];

export default function WorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? WORKOUTS
      : WORKOUTS.filter((w) => w.category === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(139,92,246,0.10)", "transparent"]}
        style={styles.topGrad}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Workout Plans</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          AI-personalized for your goal
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={{ gap: 8, paddingRight: 16 }}
        >
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? colors.purple : colors.divider,
                    backgroundColor: active ? colors.purple + "22" : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? colors.purple : colors.mutedForeground },
                  ]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.weekPlan}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
            const today = new Date().getDay();
            const dayMap = [0, 1, 2, 3, 4, 5, 6];
            const isToday = dayMap[i] === today % 7;
            return (
              <View
                key={d}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isToday ? colors.purple : colors.surface,
                    borderColor: isToday ? colors.purple : colors.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isToday ? "#FFF" : colors.mutedForeground },
                  ]}
                >
                  {d}
                </Text>
              </View>
            );
          })}
        </View>

        {filtered.map((w) => (
          <WorkoutCard key={w.id} {...w} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No workouts in this category
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
  scroll: { paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  filterBar: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  weekPlan: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  dayPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  dayText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
