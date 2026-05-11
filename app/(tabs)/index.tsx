import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { WorkoutCard } from "@/components/WorkoutCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const TODAY_WORKOUT = {
  name: "Upper Body Power",
  category: "Strength",
  duration: 45,
  calories: 320,
  level: "Intermediate",
  exercises: [
    { name: "Push-ups", sets: 4, reps: 15 },
    { name: "Dumbbell Rows", sets: 4, reps: 12 },
    { name: "Shoulder Press", sets: 3, reps: 10 },
    { name: "Bicep Curls", sets: 3, reps: 12 },
  ],
};

const QUICK_ACTIONS = [
  { icon: "scan-outline", label: "Body Scan", color: "#8B5CF6", route: "/onboarding/analyzing" },
  { icon: "camera-outline", label: "Log Meal", color: "#10B981", route: "/(tabs)/nutrition" },
  { icon: "water-outline", label: "Add Water", color: "#06B6D4", route: "/(tabs)/nutrition" },
  { icon: "trending-up-outline", label: "Progress", color: "#EC4899", route: "/(tabs)/progress" },
];

const INSIGHTS = [
  "You're 23% closer to your fat loss goal. Keep it up!",
  "Your protein intake was 14% below target yesterday — add a shake today.",
  "Great streak! 7 days in a row earns you the Fire badge.",
  "Your body score improved by 3 points this week.",
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, todayStats } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, useNativeDriver: true }),
    ]).start();
  }, []);

  const calorieProgress = todayStats.calories / todayStats.caloriesGoal;
  const proteinProgress = todayStats.protein / todayStats.proteinGoal;
  const waterProgress = todayStats.water / todayStats.waterGoal;
  const bodyScoreProgress = todayStats.bodyScore / 100;
  const randomInsight = INSIGHTS[Math.floor(Date.now() / 3600000) % INSIGHTS.length];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(139,92,246,0.12)", "transparent"]}
        style={[styles.headerGradient]}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                Good morning
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>{userProfile.name} 👋</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.streakBadge, { backgroundColor: colors.yellow + "22" }]}>
                <Ionicons name="flame" size={14} color={colors.yellow} />
                <Text style={[styles.streakText, { color: colors.yellow }]}>
                  {todayStats.streak}d
                </Text>
              </View>
              <Pressable
                style={[styles.avatar, { backgroundColor: colors.purple + "33", borderColor: colors.purple }]}
                onPress={() => {}}
              >
                <Ionicons name="person" size={18} color={colors.purple} />
              </Pressable>
            </View>
          </View>

          {/* Body Score Ring */}
          <View style={styles.scoreSection}>
            <GlassCard style={styles.scoreCard} padding={20}>
              <View style={styles.scoreContent}>
                <View>
                  <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>BODY SCORE</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>{todayStats.bodyScore}</Text>
                  <Text style={[styles.scoreChange, { color: colors.green }]}>+3 this week</Text>
                  <Text style={[styles.goalBadge, { color: colors.purpleLight }]}>
                    Goal: {userProfile.goal}
                  </Text>
                </View>
                <ProgressRing
                  size={110}
                  strokeWidth={10}
                  progress={bodyScoreProgress}
                  gradientColors={["#8B5CF6", "#06B6D4"]}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text style={[styles.ringValue, { color: colors.text }]}>{todayStats.bodyScore}</Text>
                    <Text style={[styles.ringLabel, { color: colors.mutedForeground }]}>/ 100</Text>
                  </View>
                </ProgressRing>
              </View>
            </GlassCard>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Calories"
              value={todayStats.calories}
              unit={`/ ${todayStats.caloriesGoal}`}
              progress={calorieProgress}
              gradientColors={["#EF4444", "#EC4899"]}
              color={colors.pink}
            />
            <StatCard
              label="Protein"
              value={`${todayStats.protein}g`}
              unit={`/ ${todayStats.proteinGoal}g`}
              progress={proteinProgress}
              gradientColors={["#8B5CF6", "#A78BFA"]}
              color={colors.purple}
            />
            <StatCard
              label="Water"
              value={todayStats.water}
              unit={`/ ${todayStats.waterGoal}`}
              progress={waterProgress}
              gradientColors={["#06B6D4", "#0284C7"]}
              color={colors.cyan}
            />
          </View>

          {/* AI Insight */}
          <Pressable onPress={() => router.push("/(tabs)/coach")}>
            <GlassCard style={styles.insightCard} padding={16}>
              <LinearGradient
                colors={["rgba(139,92,246,0.15)", "rgba(6,182,212,0.08)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.insightHeader}>
                <View style={[styles.aiBadge, { backgroundColor: colors.purple + "22" }]}>
                  <Ionicons name="sparkles" size={13} color={colors.purple} />
                  <Text style={[styles.aiLabel, { color: colors.purple }]}>AI Insight</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.insightText, { color: colors.text }]}>{randomInsight}</Text>
            </GlassCard>
          </Pressable>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action, i) => (
              <Pressable
                key={i}
                style={[styles.qaBtn, { backgroundColor: action.color + "18", borderColor: action.color + "33" }]}
                onPress={() => router.push(action.route as any)}
              >
                <Ionicons name={action.icon as any} size={20} color={action.color} />
                <Text style={[styles.qaLabel, { color: colors.text }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Today's Workout */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Workout</Text>
          <WorkoutCard
            {...TODAY_WORKOUT}
            accentColor={colors.purple}
            onStart={() => router.push("/(tabs)/workout")}
          />

          {/* Macro Summary */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Macros Today</Text>
          <GlassCard padding={16}>
            {[
              { label: "Protein", value: todayStats.protein, goal: todayStats.proteinGoal, color: colors.purple, unit: "g" },
              { label: "Carbs", value: todayStats.carbs, goal: todayStats.carbsGoal, color: colors.cyan, unit: "g" },
              { label: "Fat", value: todayStats.fat, goal: todayStats.fatGoal, color: colors.pink, unit: "g" },
            ].map((m) => (
              <View key={m.label} style={styles.macroRow}>
                <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                <View style={[styles.macroBg, { backgroundColor: colors.muted }]}>
                  <LinearGradient
                    colors={[m.color, m.color + "88"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.macroFill, { width: `${Math.min((m.value / m.goal) * 100, 100)}%` }]}
                  />
                </View>
                <Text style={[styles.macroValue, { color: colors.text }]}>
                  {m.value}{m.unit}
                </Text>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  scroll: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  scoreSection: { marginBottom: 14 },
  scoreCard: {},
  scoreContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  scoreValue: { fontSize: 42, fontWeight: "800", fontFamily: "Inter_700Bold", lineHeight: 48 },
  scoreChange: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  goalBadge: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 4 },
  ringValue: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" },
  ringLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  insightCard: { marginBottom: 14, overflow: "hidden" },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  aiLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  insightText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  qaBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  qaLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  macroLabel: { width: 52, fontSize: 12, fontFamily: "Inter_500Medium" },
  macroBg: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  macroFill: { height: "100%", borderRadius: 4 },
  macroValue: { width: 36, fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right" },
});
