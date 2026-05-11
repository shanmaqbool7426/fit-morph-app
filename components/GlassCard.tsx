import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  glow?: boolean;
  glowColor?: string;
  accent?: boolean;
}

export function GlassCard({ children, style, padding = 16, glow = false, glowColor, accent = false }: GlassCardProps) {
  const colors = useColors();
  const gc = glowColor ?? colors.purple;

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: glow ? gc + "44" : colors.divider,
          borderRadius: colors.radius,
          backgroundColor: colors.surface,
          shadowColor: glow ? gc : "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glow ? 0.5 : 0,
          shadowRadius: glow ? 16 : 0,
          elevation: glow ? 8 : 0,
        },
        style,
      ]}
    >
      {accent && (
        <LinearGradient
          colors={[colors.purple + "18", colors.cyan + "08"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 1,
  },
});
