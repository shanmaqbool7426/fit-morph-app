import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp, type Meal } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const QUICK_MEALS = [
  { name: "Chicken Rice Bowl", calories: 520, protein: 42, carbs: 58, fat: 12, mealType: "lunch" as const },
  { name: "Oatmeal + Protein", calories: 380, protein: 32, carbs: 48, fat: 8, mealType: "breakfast" as const },
  { name: "Greek Yogurt", calories: 180, protein: 18, carbs: 20, fat: 3, mealType: "snack" as const },
  { name: "Daal & Roti", calories: 420, protein: 22, carbs: 62, fat: 9, mealType: "dinner" as const },
  { name: "Protein Shake", calories: 200, protein: 28, carbs: 12, fat: 4, mealType: "snack" as const },
  { name: "Eggs & Toast", calories: 310, protein: 24, carbs: 28, fat: 14, mealType: "breakfast" as const },
];

const MEAL_ICONS: Record<string, string> = {
  breakfast: "sunny-outline",
  lunch: "fast-food-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "#F59E0B",
  lunch: "#10B981",
  dinner: "#8B5CF6",
  snack: "#06B6D4",
};

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function NutritionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStats, meals, addMeal, updateTodayStats } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"quick" | "log">("log");

  const calorieProgress = todayStats.calories / todayStats.caloriesGoal;
  const waterGlasses = Array.from({ length: todayStats.waterGoal }, (_, i) => i < todayStats.water);

  const addWater = () => {
    if (todayStats.water < todayStats.waterGoal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateTodayStats({ water: todayStats.water + 1 });
    }
  };

  const logMeal = (meal: (typeof QUICK_MEALS)[0]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeal({
      id: Date.now().toString(),
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      time: Date.now(),
      mealType: meal.mealType,
    });
    setShowModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(16,185,129,0.10)", "transparent"]}
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
        <Text style={[styles.title, { color: colors.text }]}>Nutrition</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Today's fuel intake
        </Text>

        {/* Calorie Ring */}
        <GlassCard style={styles.calorieCard} padding={20}>
          <View style={styles.calorieContent}>
            <ProgressRing
              size={130}
              strokeWidth={12}
              progress={calorieProgress}
              gradientColors={["#EC4899", "#8B5CF6"]}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={[styles.calValue, { color: colors.text }]}>{todayStats.calories}</Text>
                <Text style={[styles.calLabel, { color: colors.mutedForeground }]}>kcal</Text>
              </View>
            </ProgressRing>
            <View style={styles.calStats}>
              <View>
                <Text style={[styles.statNum, { color: colors.text }]}>{todayStats.caloriesGoal}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Goal</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View>
                <Text style={[styles.statNum, { color: colors.green }]}>
                  {Math.max(todayStats.caloriesGoal - todayStats.calories, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Remaining</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View>
                <Text style={[styles.statNum, { color: colors.pink }]}>320</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Burned</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Macros */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Macros</Text>
        <View style={styles.macroGrid}>
          {[
            { label: "Protein", value: todayStats.protein, goal: todayStats.proteinGoal, color: colors.purple, grad: ["#8B5CF6", "#A78BFA"] as const, unit: "g" },
            { label: "Carbs", value: todayStats.carbs, goal: todayStats.carbsGoal, color: colors.cyan, grad: ["#06B6D4", "#38BDF8"] as const, unit: "g" },
            { label: "Fat", value: todayStats.fat, goal: todayStats.fatGoal, color: colors.pink, grad: ["#EC4899", "#F472B6"] as const, unit: "g" },
          ].map((m) => (
            <GlassCard key={m.label} style={styles.macroCard} padding={14}>
              <ProgressRing
                size={70}
                strokeWidth={7}
                progress={m.value / m.goal}
                gradientColors={m.grad}
              >
                <Text style={[styles.macroVal, { color: colors.text }]}>{m.value}{m.unit}</Text>
              </ProgressRing>
              <Text style={[styles.macroName, { color: colors.text }]}>{m.label}</Text>
              <Text style={[styles.macroGoal, { color: colors.mutedForeground }]}>
                / {m.goal}{m.unit}
              </Text>
            </GlassCard>
          ))}
        </View>

        {/* Water */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hydration</Text>
        <GlassCard padding={16} style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View>
              <Text style={[styles.waterCount, { color: colors.cyan }]}>
                {todayStats.water}/{todayStats.waterGoal}
              </Text>
              <Text style={[styles.waterSub, { color: colors.mutedForeground }]}>glasses today</Text>
            </View>
            <Pressable
              onPress={addWater}
              style={[styles.addWater, { backgroundColor: colors.cyan + "22", borderColor: colors.cyan }]}
            >
              <Ionicons name="add" size={20} color={colors.cyan} />
            </Pressable>
          </View>
          <View style={styles.glasses}>
            {waterGlasses.map((filled, i) => (
              <Pressable key={i} onPress={addWater}>
                <LinearGradient
                  colors={filled ? ["#06B6D4", "#0284C7"] : [colors.muted, colors.muted]}
                  style={[styles.glass, { borderColor: filled ? colors.cyan : colors.divider }]}
                >
                  <Ionicons
                    name="water"
                    size={16}
                    color={filled ? "#FFF" : colors.mutedForeground}
                  />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        {/* Meal Log */}
        <View style={styles.mealHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meal Log</Text>
          <Pressable
            onPress={() => setShowModal(true)}
            style={[styles.addMealBtn, { backgroundColor: colors.green + "22", borderColor: colors.green }]}
          >
            <Ionicons name="add" size={16} color={colors.green} />
            <Text style={[styles.addMealText, { color: colors.green }]}>Add Meal</Text>
          </Pressable>
        </View>

        {meals.map((meal) => (
          <View
            key={meal.id}
            style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
          >
            <View style={[styles.mealIcon, { backgroundColor: MEAL_COLORS[meal.mealType] + "22" }]}>
              <Ionicons
                name={MEAL_ICONS[meal.mealType] as any}
                size={18}
                color={MEAL_COLORS[meal.mealType]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
              <Text style={[styles.mealTime, { color: colors.mutedForeground }]}>
                {formatTime(meal.time)} · P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
              </Text>
            </View>
            <Text style={[styles.mealCal, { color: colors.text }]}>{meal.calories}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowModal(false)} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.divider }]} />
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Quick Add Meal</Text>
          {QUICK_MEALS.map((meal, i) => (
            <Pressable
              key={i}
              onPress={() => logMeal(meal)}
              style={[styles.quickMealRow, { borderBottomColor: colors.divider }]}
            >
              <View style={[styles.mealIcon, { backgroundColor: MEAL_COLORS[meal.mealType] + "22" }]}>
                <Ionicons
                  name={MEAL_ICONS[meal.mealType] as any}
                  size={16}
                  color={MEAL_COLORS[meal.mealType]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                <Text style={[styles.mealTime, { color: colors.mutedForeground }]}>
                  P: {meal.protein}g · {meal.calories} kcal
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={colors.green} />
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
  scroll: { paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  calorieCard: { marginBottom: 20, overflow: "hidden" },
  calorieContent: { flexDirection: "row", alignItems: "center", gap: 24 },
  calValue: { fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold" },
  calLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  calStats: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 },
  divider: { width: 1, height: 36 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 12 },
  macroGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  macroCard: { flex: 1, alignItems: "center", gap: 6 },
  macroVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  macroName: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  macroGoal: { fontSize: 10, fontFamily: "Inter_400Regular" },
  waterCard: { marginBottom: 20, overflow: "hidden" },
  waterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  waterCount: { fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold" },
  waterSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  addWater: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  glasses: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  glass: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addMealBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  addMealText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  mealIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mealName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  mealTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  mealCal: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 16 },
  quickMealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
