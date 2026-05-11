import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  progress?: number;
  color?: string;
  style?: ViewStyle;
  gradientColors?: readonly [string, string];
  sublabel?: string;
}

export function StatCard({ label, value, unit, progress, color, style, gradientColors, sublabel }: StatCardProps) {
  const colors = useColors();
  const c = color ?? colors.purple;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: colors.radius,
          borderColor: c + "28",
          borderTopColor: c,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[c + "14", "transparent"]}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
      />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>}
      </View>
      {sublabel && (
        <Text style={[styles.sublabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
      )}
      {progress !== undefined && (
        <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
          <LinearGradient
            colors={gradientColors ?? [c, c + "88"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${Math.min(progress * 100, 100)}%` }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    borderTopWidth: 2,
    overflow: "hidden",
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    lineHeight: 26,
  },
  unit: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  barBg: {
    height: 3,
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});
