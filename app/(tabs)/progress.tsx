import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient as SvgLinearGradient, Polyline, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 32 - 32;
const CHART_HEIGHT = 100;

const BADGES = [
  { icon: "flame", label: "7-Day Streak", color: "#F59E0B", unlocked: true },
  { icon: "barbell-outline", label: "10 Workouts", color: "#8B5CF6", unlocked: true },
  { icon: "water-outline", label: "Hydration Hero", color: "#06B6D4", unlocked: true },
  { icon: "trophy-outline", label: "Goal Crusher", color: "#10B981", unlocked: false },
  { icon: "star-outline", label: "Month Master", color: "#EC4899", unlocked: false },
  { icon: "diamond-outline", label: "Elite Body", color: "#A78BFA", unlocked: false },
];

function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  const colors = useColors();
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const pad = 10;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (CHART_WIDTH - pad * 2);
    const y = pad + ((maxW - d.weight) / range) * (CHART_HEIGHT - pad * 2);
    return `${x},${y}`;
  });

  const lastPoint = points[points.length - 1].split(",");

  return (
    <View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <SvgLinearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Polyline
          points={points.join(" ")}
          fill="none"
          stroke="url(#chartGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={parseFloat(lastPoint[0])}
          cy={parseFloat(lastPoint[1])}
          r="5"
          fill="#8B5CF6"
        />
      </Svg>
      <View style={styles.chartLabels}>
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <Text key={d.date} style={[styles.chartDate, { color: colors.mutedForeground }]}>
            {d.date.slice(5)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStats, userProfile, weightLog } = useApp();

  const currentWeight = weightLog[weightLog.length - 1]?.weight ?? userProfile.weight;
  const startWeight = weightLog[0]?.weight ?? userProfile.weight;
  const weightChange = currentWeight - startWeight;
  const bmi = currentWeight / ((userProfile.height / 100) ** 2);

  const STATS = [
    { label: "Current Weight", value: `${currentWeight}kg`, color: colors.purple },
    { label: "Weight Change", value: `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg`, color: weightChange <= 0 ? colors.green : colors.pink },
    { label: "BMI", value: bmi.toFixed(1), color: colors.cyan },
    { label: "Body Score", value: `${todayStats.bodyScore}/100`, color: colors.yellow },
    { label: "Streak", value: `${todayStats.streak} days`, color: colors.green },
    { label: "Workouts", value: `${todayStats.workoutsCompleted}`, color: colors.purple },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(236,72,153,0.10)", "transparent"]}
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
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Your transformation journey
        </Text>

        {/* Body Score */}
        <GlassCard style={styles.scoreCard} padding={20}>
          <LinearGradient
            colors={["rgba(139,92,246,0.12)", "rgba(6,182,212,0.08)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.scoreRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>TRANSFORMATION SCORE</Text>
              <Text style={[styles.bigScore, { color: colors.text }]}>{todayStats.bodyScore}</Text>
              <View style={[styles.scoreBadge, { backgroundColor: colors.green + "22" }]}>
                <Ionicons name="trending-up" size={12} color={colors.green} />
                <Text style={[styles.scoreBadgeText, { color: colors.green }]}>+3 this week</Text>
              </View>
              <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>
                Great progress! Keep consistent to break 80.
              </Text>
            </View>
            <ProgressRing
              size={100}
              strokeWidth={10}
              progress={todayStats.bodyScore / 100}
              gradientColors={["#EC4899", "#8B5CF6"]}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={[styles.ringNum, { color: colors.text }]}>{todayStats.bodyScore}</Text>
                <Text style={[styles.ringSub, { color: colors.mutedForeground }]}>/ 100</Text>
              </View>
            </ProgressRing>
          </View>
        </GlassCard>

        {/* Weight Chart */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weight Trend</Text>
        <GlassCard style={styles.chartCard} padding={16}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartWeight, { color: colors.text }]}>{currentWeight} kg</Text>
            <Text
              style={[
                styles.chartChange,
                { color: weightChange <= 0 ? colors.green : colors.pink },
              ]}
            >
              {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg this week
            </Text>
          </View>
          <WeightChart data={weightLog} />
        </GlassCard>

        {/* Streak & Stats */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Stats</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                { backgroundColor: colors.surface, borderColor: colors.divider },
              ]}
            >
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Goal Progress */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal Progress</Text>
        <GlassCard padding={16} style={{ marginBottom: 20 }}>
          <View style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: colors.purple + "22" }]}>
              <Ionicons name="barbell-outline" size={20} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalName, { color: colors.text }]}>{userProfile.goal}</Text>
              <View style={[styles.goalBar, { backgroundColor: colors.muted }]}>
                <LinearGradient
                  colors={["#8B5CF6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.goalFill, { width: "38%" }]}
                />
              </View>
              <Text style={[styles.goalPct, { color: colors.mutedForeground }]}>38% complete · 42 days remaining</Text>
            </View>
          </View>
          <View style={[styles.aiInsight, { backgroundColor: colors.purple + "11", borderColor: colors.purple + "33" }]}>
            <Ionicons name="sparkles" size={13} color={colors.purple} />
            <Text style={[styles.aiInsightText, { color: colors.purpleLight }]}>
              You're 23% faster than average. Add 1 more workout per week to hit your goal 2 weeks early.
            </Text>
          </View>
        </GlassCard>

        {/* Achievement Badges */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((b, i) => (
            <View
              key={i}
              style={[
                styles.badge,
                {
                  backgroundColor: b.unlocked ? b.color + "18" : colors.surface,
                  borderColor: b.unlocked ? b.color + "44" : colors.divider,
                  opacity: b.unlocked ? 1 : 0.5,
                },
              ]}
            >
              <Ionicons
                name={b.icon as any}
                size={24}
                color={b.unlocked ? b.color : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.badgeLabel,
                  { color: b.unlocked ? colors.text : colors.mutedForeground },
                ]}
              >
                {b.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Photo Comparison Prompt */}
        <Pressable
          style={[styles.photoCTA, { backgroundColor: colors.surface, borderColor: colors.divider }]}
        >
          <LinearGradient
            colors={["rgba(139,92,246,0.12)", "rgba(6,182,212,0.06)"]}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="camera-outline" size={28} color={colors.purple} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.photoTitle, { color: colors.text }]}>Transformation Photos</Text>
            <Text style={[styles.photoSub, { color: colors.mutedForeground }]}>
              Upload weekly progress photos for AI comparison
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </Pressable>
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
  scoreCard: { marginBottom: 20, overflow: "hidden" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreLabel: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 4 },
  bigScore: { fontSize: 48, fontWeight: "800", fontFamily: "Inter_700Bold", lineHeight: 52 },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start", marginTop: 6, marginBottom: 6 },
  scoreBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scoreDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  ringNum: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  ringSub: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 12 },
  chartCard: { marginBottom: 20, overflow: "hidden" },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chartWeight: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  chartChange: { fontSize: 13, fontFamily: "Inter_500Medium" },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  chartDate: { fontSize: 10, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    width: (width - 32 - 10) / 2 - 5,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  goalRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  goalIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  goalName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  goalBar: { height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  goalFill: { height: "100%", borderRadius: 4 },
  goalPct: { fontSize: 11, fontFamily: "Inter_400Regular" },
  aiInsight: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  aiInsightText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  badge: {
    width: (width - 32 - 20) / 3,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  badgeLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  photoCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  photoTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  photoSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
