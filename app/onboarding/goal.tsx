import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const GOALS = [
  { id: "fat-loss", label: "Fat Loss", sub: "Burn fat, reveal your physique", icon: "flame-outline", colors: ["#EF4444", "#DC2626"] as const },
  { id: "muscle-gain", label: "Muscle Gain", sub: "Build lean mass and strength", icon: "barbell-outline", colors: ["#8B5CF6", "#6D28D9"] as const },
  { id: "lean-body", label: "Lean Body", sub: "Toned, fit, and defined look", icon: "body-outline", colors: ["#06B6D4", "#0284C7"] as const },
  { id: "athletic", label: "Athletic Performance", sub: "Speed, power, and endurance", icon: "trophy-outline", colors: ["#F59E0B", "#D97706"] as const },
  { id: "six-pack", label: "Six-Pack Core", sub: "Sculpt a visible core", icon: "fitness-outline", colors: ["#10B981", "#059669"] as const },
];

export default function GoalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateUserProfile } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    const goal = GOALS.find((g) => g.id === selected);
    updateUserProfile({ goal: goal?.label ?? selected });
    router.push("/onboarding/body-type");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#07070E", "#0D0420"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
            paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progress}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i === 0 ? colors.purple : colors.divider },
                i === 0 && { width: 24 },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.heading, { color: colors.text }]}>What's your{"\n"}primary goal?</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Your AI coach will create a plan tailored to this goal.
        </Text>
        <View style={styles.grid}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <Pressable
                key={goal.id}
                onPress={() => handleSelect(goal.id)}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: isSelected ? goal.colors[0] + "22" : colors.surface,
                    borderColor: isSelected ? goal.colors[0] : colors.divider,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[goal.colors[0] + "15", "transparent"]}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <LinearGradient
                  colors={goal.colors}
                  style={styles.goalIcon}
                >
                  <Ionicons name={goal.icon as any} size={24} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.goalLabel, { color: colors.text }]}>{goal.label}</Text>
                <Text style={[styles.goalSub, { color: colors.mutedForeground }]}>{goal.sub}</Text>
                {isSelected && (
                  <View style={[styles.check, { backgroundColor: goal.colors[0] }]}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 12 },
        ]}
      >
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  progress: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 28,
  },
  progressDot: {
    height: 4,
    width: 8,
    borderRadius: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 40,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 28,
  },
  grid: {
    gap: 12,
  },
  goalCard: {
    padding: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    gap: 6,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  goalSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  check: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(7,7,14,0.95)",
  },
});
