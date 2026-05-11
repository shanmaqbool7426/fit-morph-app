import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: string;
  rest?: number;
}

interface WorkoutCardProps {
  name: string;
  category: string;
  duration: number;
  calories: number;
  level: string;
  exercises: Exercise[];
  accentColor?: string;
  onStart?: () => void;
}

export function WorkoutCard({
  name,
  category,
  duration,
  calories,
  level,
  exercises,
  accentColor,
  onStart,
}: WorkoutCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const color = accentColor ?? colors.purple;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: colors.radius,
            borderColor: colors.divider,
            borderLeftColor: color,
          },
        ]}
      >
        <LinearGradient
          colors={[color + "18", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <View>
              <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.category, { color: colors.mutedForeground }]}>{category}</Text>
            </View>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="zap" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{calories} kcal</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + "22" }]}>
            <Text style={[styles.badgeText, { color }]}>{level}</Text>
          </View>
        </View>
        {expanded && (
          <View style={[styles.exercises, { borderTopColor: colors.divider }]}>
            {exercises.map((ex, i) => (
              <View key={i} style={styles.exercise}>
                <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                <Text style={[styles.exDetail, { color: colors.mutedForeground }]}>
                  {ex.sets} × {ex.reps ? `${ex.reps} reps` : ex.duration}
                </Text>
              </View>
            ))}
            {onStart && (
              <Pressable
                onPress={onStart}
                style={[styles.startBtn, { backgroundColor: color }]}
              >
                <Text style={styles.startText}>Start Workout</Text>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 8,
  },
  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: "auto",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  exercises: {
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  exercise: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  exDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  startBtn: {
    marginTop: 8,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
