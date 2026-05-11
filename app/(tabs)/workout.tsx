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
import { WORKOUTS } from "@/constants/workouts";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Strength", "HIIT", "Fat Loss", "Mobility", "Home"];

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
        colors={["rgba(124,58,237,0.15)", "transparent"]}
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
            const isToday = i === (today === 0 ? 6 : today - 1);
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
