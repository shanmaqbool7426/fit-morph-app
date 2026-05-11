import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  variant?: "primary" | "cyan" | "pink" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;
}

const GRADIENT_MAPS = {
  primary: ["#7C3AED", "#5B21B6"] as const,
  cyan: ["#22D3EE", "#0891B2"] as const,
  pink: ["#EC4899", "#9333EA"] as const,
  outline: ["transparent", "transparent"] as const,
};

export function GradientButton({ onPress, title, style, variant = "primary", size = "lg", disabled = false, icon }: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : 1,
  }));

  const heights = { sm: 42, md: 50, lg: 58 };
  const fontSizes = { sm: 13, md: 15, lg: 16 };

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={() => {
          if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }
        }}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        disabled={disabled}
      >
        <LinearGradient
          colors={GRADIENT_MAPS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            { height: heights[size], borderRadius: 12 },
            variant === "outline" && styles.outline,
          ]}
        >
          {icon && <View>{icon}</View>}
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
  outline: {
    borderWidth: 1.5,
    borderColor: "rgba(124,58,237,0.6)",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.4,
    fontFamily: "Inter_700Bold",
  },
});
