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
}

export function StatCard({
  label,
  value,
  unit,
  progress,
  color,
  style,
  gradientColors,
}: StatCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: colors.radius,
          borderColor: colors.divider,
        },
        style,
      ]}
    >
      {gradientColors && (
        <LinearGradient
          colors={gradientColors}
          style={[StyleSheet.absoluteFill, { borderRadius: colors.radius, opacity: 0.12 }]}
        />
      )}
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: color ?? colors.text }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>}
      </View>
      {progress !== undefined && (
        <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
          <LinearGradient
            colors={gradientColors ?? ["#8B5CF6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.barFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
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
    overflow: "hidden",
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    marginBottom: 3,
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
