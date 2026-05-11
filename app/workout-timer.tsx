import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getWorkoutById, type Workout } from "@/constants/workouts";
import { useColors } from "@/hooks/useColors";

type Phase = "ready" | "active" | "rest" | "complete";

function TimerRing({
  progress,
  size,
  color,
  children,
}: {
  progress: number;
  size: number;
  color: string;
  children?: React.ReactNode;
}) {
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)));
  const cx = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <SvgGrad id="trg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor="#22D3EE" stopOpacity="1" />
          </SvgGrad>
        </Defs>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <Circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke="url(#trg)" strokeWidth={sw}
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
      {children}
    </View>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function WorkoutTimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout: Workout | undefined = getWorkoutById(id ?? "1");

  const [phase, setPhase] = useState<Phase>("ready");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const exercise = workout?.exercises[exerciseIdx];
  const totalExercises = workout?.exercises.length ?? 0;
  const totalSetsInWorkout = workout?.exercises.reduce((s, e) => s + e.sets, 0) ?? 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, useNativeDriver: true }),
    ]).start();
  }, [phase, exerciseIdx, setIdx]);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startElapsedTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, []);

  const stopElapsedTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRest = useCallback((seconds: number) => {
    setRestTotal(seconds);
    setRestSeconds(seconds);
    setPhase("rest");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    restRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current!);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setPhase("active");
          fadeAnim.setValue(0);
          slideAnim.setValue(20);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, damping: 20, useNativeDriver: true }),
          ]).start();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleStart = useCallback(() => {
    setPhase("active");
    startElapsedTimer();
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleCompleteSet = useCallback(() => {
    if (!workout || !exercise) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newTotalSets = totalSets + 1;
    setTotalSets(newTotalSets);

    const nextSet = setIdx + 1;
    if (nextSet < exercise.sets) {
      // More sets in this exercise — rest then continue
      setSetIdx(nextSet);
      const restDur = exercise.restSeconds ?? 60;
      startRest(restDur);
    } else {
      // Exercise complete — move to next exercise
      const nextExercise = exerciseIdx + 1;
      if (nextExercise < totalExercises) {
        setExerciseIdx(nextExercise);
        setSetIdx(0);
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        const restDur = exercise.restSeconds ?? 60;
        startRest(restDur);
      } else {
        // Workout complete!
        stopElapsedTimer();
        setPhase("complete");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [workout, exercise, setIdx, exerciseIdx, totalExercises, totalSets]);

  const handleSkipRest = useCallback(() => {
    clearInterval(restRef.current!);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("active");
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused((p) => {
      if (p) {
        startElapsedTimer();
      } else {
        stopElapsedTimer();
      }
      return !p;
    });
  }, []);

  useEffect(() => {
    return () => {
      stopElapsedTimer();
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Workout not found</Text>
      </View>
    );
  }

  const accentColor = workout.accentColor;
  const overallProgress = totalSets / totalSetsInWorkout;
  const exerciseProgress = (exerciseIdx + (setIdx / (exercise?.sets ?? 1))) / totalExercises;

  // READY SCREEN
  if (phase === "ready") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[accentColor + "22", "transparent", colors.background]} style={StyleSheet.absoluteFill} />
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ready to Train</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.readyScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.workoutBadge, { backgroundColor: accentColor + "20", borderColor: accentColor + "44" }]}>
            <Ionicons name="barbell-outline" size={14} color={accentColor} />
            <Text style={[styles.workoutBadgeText, { color: accentColor }]}>{workout.category}</Text>
          </View>
          <Text style={[styles.workoutName, { color: colors.text }]}>{workout.name}</Text>

          <View style={styles.readyMeta}>
            {[
              { icon: "time-outline" as const, label: `${workout.duration} min`, color: colors.cyan },
              { icon: "flame-outline" as const, label: `${workout.calories} kcal`, color: "#F59E0B" },
              { icon: "barbell-outline" as const, label: workout.level, color: accentColor },
            ].map((m) => (
              <View key={m.label} style={[styles.metaChip, { backgroundColor: m.color + "15", borderColor: m.color + "30" }]}>
                <Ionicons name={m.icon} size={14} color={m.color} />
                <Text style={[styles.metaChipText, { color: m.color }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.exerciseList, { borderColor: colors.divider }]}>
            <Text style={[styles.listTitle, { color: colors.mutedForeground }]}>EXERCISE PLAN</Text>
            {workout.exercises.map((ex, i) => (
              <View key={i} style={[styles.exerciseRow, { borderBottomColor: colors.divider }]}>
                <View style={[styles.exNum, { backgroundColor: accentColor + "20" }]}>
                  <Text style={[styles.exNumText, { color: accentColor }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.exDetail, { color: colors.mutedForeground }]}>
                    {ex.sets} sets × {ex.reps ? `${ex.reps} reps` : ex.duration} · Rest {ex.restSeconds ?? 60}s
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.startFooter, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 12 }]}>
          <Pressable onPress={handleStart} style={styles.startPressable}>
            <LinearGradient colors={[accentColor, accentColor + "BB"]} style={styles.startBtn}>
              <Ionicons name="play" size={22} color="#FFF" />
              <Text style={styles.startBtnText}>Start Workout</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  // COMPLETE SCREEN
  if (phase === "complete") {
    const calBurned = Math.round((elapsed / 60) * (workout.calories / workout.duration));
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["rgba(124,58,237,0.25)", "rgba(34,211,238,0.1)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 24 }}>
          <LinearGradient colors={["#7C3AED", "#22D3EE"]} style={styles.completeTrophy}>
            <Ionicons name="trophy" size={44} color="#FFF" />
          </LinearGradient>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Text style={[styles.completeTitle, { color: colors.text }]}>Workout Complete!</Text>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
              Outstanding effort — you crushed it!
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: "Duration", value: formatTime(elapsed), icon: "time-outline" as const, color: colors.cyan },
              { label: "Calories", value: `${calBurned}`, icon: "flame-outline" as const, color: "#F59E0B" },
              { label: "Exercises", value: `${totalExercises}`, icon: "barbell-outline" as const, color: accentColor },
              { label: "Sets Done", value: `${totalSets}`, icon: "checkmark-circle-outline" as const, color: colors.green },
            ].map((s) => (
              <View key={s.label} style={[styles.completeStat, { backgroundColor: s.color + "14", borderColor: s.color + "30" }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={[styles.completeStatVal, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.completeStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.streakBanner, { backgroundColor: "#F59E0B18", borderColor: "#F59E0B44" }]}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={[styles.streakBannerText, { color: "#F59E0B" }]}>7-Day Streak maintained!</Text>
            <Ionicons name="flame" size={18} color="#F59E0B" />
          </View>

          <View style={{ width: "100%", gap: 10 }}>
            <Pressable onPress={() => router.replace("/(tabs)/")} style={styles.donePresssable}>
              <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => router.back()} style={[styles.anotherBtn, { borderColor: colors.divider, backgroundColor: colors.surface }]}>
              <Text style={[styles.anotherBtnText, { color: colors.mutedForeground }]}>Do Another Workout</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // REST SCREEN
  if (phase === "rest") {
    const restProgress = restSeconds / restTotal;
    const nextEx = workout.exercises[exerciseIdx];
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["rgba(16,185,129,0.15)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{workout.name}</Text>
          <View style={[styles.elapsedBadge, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.elapsedText, { color: colors.mutedForeground }]}>{formatTime(elapsed)}</Text>
          </View>
        </View>

        <View style={styles.restContent}>
          <View style={[styles.restLabel, { backgroundColor: colors.green + "20", borderColor: colors.green + "44" }]}>
            <Ionicons name="leaf-outline" size={14} color={colors.green} />
            <Text style={[styles.restLabelText, { color: colors.green }]}>REST PERIOD</Text>
          </View>

          <TimerRing progress={restProgress} size={200} color={colors.green}>
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.restSeconds, { color: colors.text }]}>{restSeconds}</Text>
              <Text style={[styles.restSecondsLabel, { color: colors.mutedForeground }]}>seconds</Text>
            </View>
          </TimerRing>

          <View style={[styles.nextExCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Text style={[styles.nextExLabel, { color: colors.mutedForeground }]}>COMING UP NEXT</Text>
            <Text style={[styles.nextExName, { color: colors.text }]}>{nextEx.name}</Text>
            <Text style={[styles.nextExDetail, { color: colors.mutedForeground }]}>
              Set {setIdx + 1} of {nextEx.sets} · {nextEx.reps ? `${nextEx.reps} reps` : nextEx.duration}
            </Text>
          </View>

          <Pressable onPress={handleSkipRest} style={[styles.skipBtn, { borderColor: colors.divider, backgroundColor: colors.surface }]}>
            <Ionicons name="play-skip-forward-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>Skip Rest</Text>
          </Pressable>
        </View>

        <View style={[styles.progressFooter, { borderTopColor: colors.divider }]}>
          <LinearGradient colors={[accentColor, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${Math.round(overallProgress * 100)}%` as any }]} />
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {Math.round(overallProgress * 100)}% complete
          </Text>
        </View>
      </View>
    );
  }

  // ACTIVE SCREEN
  const setRepLabel = exercise?.reps ? `${exercise.reps} reps` : exercise?.duration ?? "";
  const nextExercise = workout.exercises[exerciseIdx + 1];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[accentColor + "18", "transparent"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{workout.name}</Text>
        <View style={[styles.elapsedBadge, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <Ionicons name="time-outline" size={12} color={colors.cyan} />
          <Text style={[styles.elapsedText, { color: colors.cyan }]}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      {/* Overall progress bar */}
      <View style={[styles.overallBar, { backgroundColor: colors.muted }]}>
        <LinearGradient
          colors={[accentColor, colors.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.overallFill, { width: `${Math.max(2, Math.round(overallProgress * 100))}%` as any }]}
        />
      </View>
      <View style={styles.overallLabels}>
        <Text style={[styles.overallLabel, { color: colors.mutedForeground }]}>
          Exercise {exerciseIdx + 1}/{totalExercises}
        </Text>
        <Text style={[styles.overallLabel, { color: colors.mutedForeground }]}>
          {Math.round(overallProgress * 100)}% done
        </Text>
      </View>

      {/* Main content */}
      <Animated.View style={[styles.activeMain, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Exercise ring */}
        <TimerRing progress={exerciseProgress} size={180} color={accentColor}>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>SET</Text>
            <Text style={[styles.setCurrent, { color: accentColor }]}>{setIdx + 1}</Text>
            <Text style={[styles.setOf, { color: colors.mutedForeground }]}>of {exercise?.sets}</Text>
          </View>
        </TimerRing>

        {/* Exercise name */}
        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise?.name}</Text>
          <View style={[styles.repBadge, { backgroundColor: accentColor + "20", borderColor: accentColor + "44" }]}>
            <Text style={[styles.repBadgeText, { color: accentColor }]}>{setRepLabel}</Text>
          </View>
        </View>

        {/* Pause / Complete */}
        <View style={styles.actionRow}>
          <Pressable onPress={handlePause} style={[styles.pauseBtn, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Ionicons name={isPaused ? "play-outline" : "pause-outline"} size={20} color={colors.text} />
          </Pressable>

          <Pressable onPress={handleCompleteSet} style={styles.completeSetPressable}>
            <LinearGradient colors={[accentColor, accentColor + "CC"]} style={styles.completeSetBtn}>
              <Ionicons name="checkmark" size={22} color="#FFF" />
              <Text style={styles.completeSetText}>
                {isPaused ? "Paused" : "Set Complete"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Up next */}
        {nextExercise ? (
          <View style={[styles.upNext, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Text style={[styles.upNextLabel, { color: colors.mutedForeground }]}>UP NEXT</Text>
            <Text style={[styles.upNextName, { color: colors.text }]}>{nextExercise.name}</Text>
            <Text style={[styles.upNextDetail, { color: colors.mutedForeground }]}>
              {nextExercise.sets} sets · {nextExercise.reps ? `${nextExercise.reps} reps` : nextExercise.duration}
            </Text>
          </View>
        ) : (
          <View style={[styles.upNext, { backgroundColor: colors.green + "12", borderColor: colors.green + "30" }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.green} />
            <Text style={[styles.upNextName, { color: colors.green }]}>Last exercise — almost done!</Text>
          </View>
        )}
      </Animated.View>

      {/* Sets progress dots */}
      <View style={styles.setDots}>
        {Array.from({ length: exercise?.sets ?? 0 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.setDot,
              {
                backgroundColor: i < setIdx ? accentColor : i === setIdx ? accentColor + "66" : colors.muted,
                width: i === setIdx ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Footer progress */}
      <View style={[styles.progressFooter, { borderTopColor: colors.divider, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8 }]}>
        <LinearGradient colors={[accentColor, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${Math.max(2, Math.round(overallProgress * 100))}%` as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { textAlign: "center", marginTop: 100, fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700",
    flex: 1, textAlign: "center", marginHorizontal: 8,
  },
  elapsedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16, borderWidth: 1,
  },
  elapsedText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  // Ready screen
  readyScroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 16 },
  workoutBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  workoutBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  workoutName: { fontSize: 30, fontFamily: "Inter_700Bold", fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 },
  readyMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  metaChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  exerciseList: {
    borderRadius: 14, borderWidth: 1, overflow: "hidden",
    padding: 16, gap: 4,
  },
  listTitle: {
    fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  exNum: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  exNumText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  exDetail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  startFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
  },
  startPressable: { borderRadius: 14, overflow: "hidden" },
  startBtn: {
    height: 58, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, borderRadius: 14,
  },
  startBtnText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },

  // Active screen
  overallBar: { height: 3, marginHorizontal: 16, borderRadius: 2, overflow: "hidden" },
  overallFill: { height: "100%", borderRadius: 2 },
  overallLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
  overallLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  activeMain: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 20, gap: 20,
  },
  setLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  setCurrent: { fontSize: 40, fontFamily: "Inter_700Bold", fontWeight: "800", lineHeight: 44 },
  setOf: { fontSize: 13, fontFamily: "Inter_400Regular" },
  exerciseName: { fontSize: 24, fontFamily: "Inter_700Bold", fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  repBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  repBadgeText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  actionRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  pauseBtn: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  completeSetPressable: { flex: 1, borderRadius: 14, overflow: "hidden" },
  completeSetBtn: {
    height: 54, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, borderRadius: 14,
  },
  completeSetText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  upNext: {
    width: "100%", flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  upNextLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6 },
  upNextName: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  upNextDetail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  setDots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 12 },
  setDot: { height: 8, borderRadius: 4 },

  // Rest screen
  restContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, paddingHorizontal: 20 },
  restLabel: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  restLabelText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  restSeconds: { fontSize: 52, fontFamily: "Inter_700Bold", fontWeight: "800" },
  restSecondsLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  nextExCard: { width: "100%", padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  nextExLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase" },
  nextExName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  nextExDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skipBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1,
  },
  skipBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // Complete screen
  completeTrophy: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
  },
  completeTitle: { fontSize: 30, fontFamily: "Inter_700Bold", fontWeight: "800", letterSpacing: -0.5 },
  completeSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%" },
  completeStat: {
    flex: 1, minWidth: "42%", padding: 16,
    borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6,
  },
  completeStatVal: { fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "800" },
  completeStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  streakBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 20, borderWidth: 1, width: "100%", justifyContent: "center",
  },
  streakBannerText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  donePresssable: { borderRadius: 14, overflow: "hidden" },
  doneBtn: { height: 54, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  doneBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  anotherBtn: { height: 48, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  anotherBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Shared
  progressFooter: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 6 },
  progressLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
});
