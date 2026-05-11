import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const BODY_TYPES = [
  {
    id: "ectomorph",
    label: "Ectomorph",
    sub: "Naturally lean, hard to gain weight",
    traits: ["Fast metabolism", "Narrow shoulders", "Difficulty building muscle"],
    icon: "body-outline" as const,
    colors: ["#06B6D4", "#0284C7"] as const,
  },
  {
    id: "mesomorph",
    label: "Mesomorph",
    sub: "Athletic build, responds well to training",
    traits: ["Gains muscle easily", "Defined physique", "Medium frame"],
    icon: "fitness-outline" as const,
    colors: ["#8B5CF6", "#6D28D9"] as const,
  },
  {
    id: "endomorph",
    label: "Endomorph",
    sub: "Larger frame, tendency to store fat",
    traits: ["Slow metabolism", "Gains fat easily", "High endurance"],
    icon: "barbell-outline" as const,
    colors: ["#EC4899", "#BE185D"] as const,
  },
];

export default function BodyTypeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, setOnboardingComplete } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelected(id);
  };

  const handleContinue = async () => {
    if (!selected) return;
    const bt = BODY_TYPES.find((b) => b.id === selected);
    updateUserProfile({ bodyType: bt?.label ?? selected });
    router.push("/onboarding/analyzing");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#07070E", "#0D0420"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
            paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <View style={styles.progress}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i < 2 ? colors.purple : colors.divider },
                i === 1 && { width: 24 },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.heading, { color: colors.text }]}>Your body{"\n"}type?</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          The AI uses this to calibrate your plan for maximum results.
        </Text>
        <View style={styles.cards}>
          {BODY_TYPES.map((bt) => {
            const isSelected = selected === bt.id;
            return (
              <Pressable
                key={bt.id}
                onPress={() => handleSelect(bt.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? bt.colors[0] + "18" : colors.surface,
                    borderColor: isSelected ? bt.colors[0] : colors.divider,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={styles.cardLeft}>
                  <LinearGradient colors={bt.colors} style={styles.iconBg}>
                    <Ionicons name={bt.icon} size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.btLabel, { color: colors.text }]}>{bt.label}</Text>
                    <Text style={[styles.btSub, { color: colors.mutedForeground }]}>{bt.sub}</Text>
                    <View style={styles.traits}>
                      {bt.traits.map((t, i) => (
                        <View key={i} style={styles.trait}>
                          <View style={[styles.traitDot, { backgroundColor: bt.colors[0] }]} />
                          <Text style={[styles.traitText, { color: colors.mutedForeground }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.check, { backgroundColor: bt.colors[0] }]}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 12 },
        ]}
      >
        <GradientButton
          title="Analyze My Body"
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
  inner: { flex: 1, paddingHorizontal: 20 },
  progress: { flexDirection: "row", gap: 6, marginBottom: 28 },
  progressDot: { height: 4, width: 8, borderRadius: 4 },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 24,
  },
  cards: { gap: 12 },
  card: {
    padding: 16,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardLeft: { flexDirection: "row", gap: 14 },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btLabel: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  btSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  traits: { gap: 3 },
  trait: { flexDirection: "row", alignItems: "center", gap: 6 },
  traitDot: { width: 5, height: 5, borderRadius: 3 },
  traitText: { fontSize: 11, fontFamily: "Inter_400Regular" },
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
