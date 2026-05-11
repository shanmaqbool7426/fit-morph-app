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
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
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
  { icon: "scan-outline" as const, label: "Body\nScan", color: "#22D3EE", route: "/onboarding/analyzing" },
  { icon: "camera-outline" as const, label: "Log\nMeal", color: "#10B981", route: "/(tabs)/nutrition" },
  { icon: "water-outline" as const, label: "Add\nWater", color: "#7C3AED", route: "/(tabs)/nutrition" },
  { icon: "trending-up-outline" as const, label: "Progress", color: "#EC4899", route: "/(tabs)/progress" },
  { icon: "barbell-outline" as const, label: "Workout", color: "#F59E0B", route: "/(tabs)/workout" },
];

const INSIGHTS = [
  "You're 23% closer to your fat loss goal. Keep it up!",
  "Your protein intake was 14% below target yesterday — add a shake today.",
  "Great streak! 7 days in a row earns you the Fire badge.",
  "Your body score improved by 3 points this week — crushing it!",
];

function BodyScoreRing({ score, size = 90 }: { score: number; size?: number }) {
  const colors = useColors();
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <SvgGrad id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22D3EE" />
            <Stop offset="100%" stopColor="#7C3AED" />
          </SvgGrad>
        </Defs>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="url(#sg)" strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`} />
      </Svg>
      <Text style={{ color: colors.cyan, fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" }}>{score}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, todayStats } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 22, useNativeDriver: true }),
    ]).start();
  }, []);

  const randomInsight = INSIGHTS[Math.floor(Date.now() / 3600000) % INSIGHTS.length];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(124,58,237,0.15)", "transparent"]}
        style={styles.headerGlow}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 14,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
              <Text style={[styles.name, { color: colors.text }]}>{userProfile.name}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.streakBadge, { backgroundColor: "#F59E0B18", borderColor: "#F59E0B30" }]}>
                <Ionicons name="flame" size={13} color="#F59E0B" />
                <Text style={[styles.streakText, { color: "#F59E0B" }]}>{todayStats.streak}d streak</Text>
              </View>
              <Pressable style={[styles.avatar, { backgroundColor: colors.purple + "22", borderColor: colors.purple + "55" }]}>
                <Ionicons name="person" size={17} color={colors.purple} />
              </Pressable>
            </View>
          </View>

          {/* Body Scan Card */}
          <GlassCard style={styles.bodyScanCard} padding={0} glow glowColor={colors.cyan}>
            <LinearGradient
              colors={["rgba(34,211,238,0.12)", "rgba(124,58,237,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bodyScanInner}>
              <View style={styles.bodyScanLeft}>
                <Text style={[styles.scanTag, { color: colors.mutedForeground }]}>AI BODY SCAN REPORT</Text>
                <Text style={[styles.scanTitle, { color: colors.text }]}>Body Score</Text>
                <BodyScoreRing score={todayStats.bodyScore} size={90} />
                <View style={[styles.scoreTrend, { backgroundColor: colors.green + "20" }]}>
                  <Ionicons name="trending-up" size={11} color={colors.green} />
                  <Text style={[styles.scoreTrendText, { color: colors.green }]}>+3 this week</Text>
                </View>
              </View>
              <View style={styles.bodyScanRight}>
                <Text style={[styles.scanMetaTitle, { color: colors.text }]}>{userProfile.goal}</Text>
                <Text style={[styles.scanMetaSub, { color: colors.mutedForeground }]}>{userProfile.bodyType} · Active</Text>
                {[
                  { label: "Body Fat", value: "18%", color: colors.pink },
                  { label: "Muscle Mass", value: "36 kg", color: colors.cyan },
                  { label: "Fitness Level", value: "Inter.", color: colors.purple },
                ].map((m) => (
                  <View key={m.label} style={styles.miniStat}>
                    <View style={[styles.miniDot, { backgroundColor: m.color }]} />
                    <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                    <Text style={[styles.miniVal, { color: m.color }]}>{m.value}</Text>
                  </View>
                ))}
                <Pressable
                  onPress={() => router.push("/(tabs)/progress")}
                  style={[styles.viewReport, { borderColor: colors.cyan + "44", backgroundColor: colors.cyan + "12" }]}
                >
                  <Text style={[styles.viewReportText, { color: colors.cyan }]}>View Report</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.cyan} />
                </Pressable>
              </View>
            </View>
          </GlassCard>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Calories"
              value={todayStats.calories}
              unit={`/${todayStats.caloriesGoal}`}
              progress={todayStats.calories / todayStats.caloriesGoal}
              gradientColors={["#EC4899", "#F43F5E"]}
              color="#EC4899"
              sublabel="kcal today"
            />
            <StatCard
              label="Protein"
              value={`${todayStats.protein}g`}
              unit={`/${todayStats.proteinGoal}g`}
              progress={todayStats.protein / todayStats.proteinGoal}
              gradientColors={["#7C3AED", "#A78BFA"]}
              color="#7C3AED"
              sublabel="daily target"
            />
            <StatCard
              label="Water"
              value={todayStats.water}
              unit={`/${todayStats.waterGoal}`}
              progress={todayStats.water / todayStats.waterGoal}
              gradientColors={["#22D3EE", "#38BDF8"]}
              color="#22D3EE"
              sublabel="glasses"
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((a, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(a.route as any)}
                style={[styles.qaBtn, { backgroundColor: a.color + "14", borderColor: a.color + "30" }]}
              >
                <View style={[styles.qaIcon, { backgroundColor: a.color + "20" }]}>
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={[styles.qaLabel, { color: colors.text }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* AI Insight */}
          <Pressable onPress={() => router.push("/(tabs)/coach")}>
            <LinearGradient
              colors={["rgba(124,58,237,0.22)", "rgba(34,211,238,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.insightCard, { borderColor: colors.purple + "40", borderRadius: colors.radius }]}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.aiBadge, { backgroundColor: colors.purple + "25" }]}>
                  <Ionicons name="sparkles" size={12} color={colors.purpleLight} />
                  <Text style={[styles.aiLabel, { color: colors.purpleLight }]}>AI Coach Insight</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.insightText, { color: colors.text }]}>{randomInsight}</Text>
            </LinearGradient>
          </Pressable>

          {/* Today's Workout */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Workout</Text>
            <Pressable onPress={() => router.push("/(tabs)/workout")}>
              <Text style={[styles.seeAll, { color: colors.cyan }]}>See all</Text>
            </Pressable>
          </View>
          <WorkoutCard
            {...TODAY_WORKOUT}
            accentColor={colors.purple}
            onStart={() => router.push("/(tabs)/workout")}
          />

          {/* Macro Breakdown */}
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
                    colors={[m.color, m.color + "66"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.macroFill, { width: `${Math.min((m.value / m.goal) * 100, 100)}%` }]}
                  />
                </View>
                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}{m.unit}</Text>
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
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 220 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.3 },
  name: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  streakText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  bodyScanCard: { marginBottom: 14, overflow: "hidden" },
  bodyScanInner: { flexDirection: "row", padding: 16, gap: 16 },
  bodyScanLeft: { alignItems: "center", gap: 6, minWidth: 100 },
  scanTag: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textAlign: "center" },
  scanTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scoreTrend: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  scoreTrendText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  bodyScanRight: { flex: 1, gap: 6, justifyContent: "center" },
  scanMetaTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scanMetaSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 4 },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniLabel: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  miniVal: { fontSize: 12, fontFamily: "Inter_700Bold" },
  viewReport: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
    alignSelf: "flex-start", marginTop: 4,
  },
  viewReportText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  quickActions: { flexDirection: "row", gap: 8, marginBottom: 14 },
  qaBtn: {
    flex: 1, alignItems: "center", paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, gap: 5,
  },
  qaIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 13 },
  insightCard: { padding: 14, borderWidth: 1, marginBottom: 14 },
  insightHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  aiLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  insightText: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 19 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 10 },
  seeAll: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  macroRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  macroLabel: { width: 48, fontSize: 11, fontFamily: "Inter_500Medium" },
  macroBg: { flex: 1, height: 5, borderRadius: 4, overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: 4 },
  macroValue: { width: 38, fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "right" },
});
