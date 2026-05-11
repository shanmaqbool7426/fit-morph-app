import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: string;
}

interface WorkoutCardProps {
  id?: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  level: string;
  exercises: Exercise[];
  accentColor?: string;
  onStart?: () => void;
}

export function WorkoutCard({ id, name, category, duration, calories, level, exercises, accentColor, onStart }: WorkoutCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const color = accentColor ?? colors.purple;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else if (id) {
      router.push({ pathname: "/workout-timer", params: { id } });
    }
  };

  return (
    <Animated.View style={[animStyle, { marginBottom: 12 }]}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.card, { backgroundColor: colors.surface, borderRadius: colors.radius, borderColor: color + "30" }]}
      >
        <LinearGradient
          colors={[color + "18", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.accentBar, { backgroundColor: color }]} />
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <View style={[styles.catBadge, { backgroundColor: color + "20" }]}>
              <Text style={[styles.catText, { color }]}>{category}</Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.cyan} />
            <Text style={[styles.metaText, { color: colors.text }]}>{duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="zap" size={12} color={colors.yellow} />
            <Text style={[styles.metaText, { color: colors.text }]}>{calories} kcal</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: color + "18", borderColor: color + "30" }]}>
            <Text style={[styles.levelText, { color }]}>{level}</Text>
          </View>
        </View>
        {expanded && (
          <View style={[styles.exercises, { borderTopColor: colors.divider }]}>
            {exercises.map((ex, i) => (
              <View key={i} style={[styles.exercise, { borderBottomColor: colors.divider }]}>
                <View style={[styles.exNum, { backgroundColor: color + "18" }]}>
                  <Text style={[styles.exNumText, { color }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                <Text style={[styles.exDetail, { color: colors.mutedForeground }]}>
                  {ex.sets} × {ex.reps ? `${ex.reps} reps` : ex.duration}
                </Text>
              </View>
            ))}
            <Pressable onPress={handleStart} style={[styles.startBtn, { backgroundColor: color }]}>
              <Ionicons name="play" size={14} color="#FFF" />
              <Text style={styles.startText}>Start Workout</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: {
    height: 3,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingBottom: 8,
  },
  titleArea: { flex: 1, gap: 4 },
  catBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 0.5, textTransform: "uppercase" },
  name: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  levelBadge: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  exercises: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 0,
  },
  exercise: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exNum: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  exNumText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  exName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  exDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  startBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  startText: {
    color: "#FFF",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
