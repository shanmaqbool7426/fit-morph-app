import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  variant?: "primary" | "cyan" | "pink";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const GRADIENT_MAPS = {
  primary: ["#8B5CF6", "#6D28D9"] as const,
  cyan: ["#06B6D4", "#0284C7"] as const,
  pink: ["#EC4899", "#9333EA"] as const,
};

export function GradientButton({
  onPress,
  title,
  style,
  variant = "primary",
  size = "lg",
  disabled = false,
}: GradientButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const heights = { sm: 44, md: 52, lg: 60 };
  const fontSizes = { sm: 14, md: 16, lg: 17 };

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={() => {
          if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }
        }}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        disabled={disabled}
      >
        <LinearGradient
          colors={GRADIENT_MAPS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            { height: heights[size], borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.text, { fontSize: fontSizes[size] }]}>{title}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.3,
    fontFamily: "Inter_700Bold",
  },
});
