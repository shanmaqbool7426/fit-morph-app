import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  blur?: number;
}

export function GlassCard({ children, style, padding = 16, blur = 20 }: GlassCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: colors.divider,
          borderRadius: colors.radius,
          backgroundColor: colors.cardGlass,
        },
        style,
      ]}
    >
      <BlurView intensity={blur} tint="dark" style={StyleSheet.absoluteFill} />
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
