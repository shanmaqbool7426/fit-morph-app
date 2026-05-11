import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const STEPS = [
  { label: "Scanning body metrics", icon: "scan-outline" },
  { label: "Generating workout plan", icon: "barbell-outline" },
  { label: "Calibrating AI coach", icon: "chatbubble-ellipses-outline" },
  { label: "Creating nutrition strategy", icon: "nutrition-outline" },
  { label: "Finalizing your dashboard", icon: "speedometer-outline" },
];

export default function AnalyzingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setOnboardingComplete } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    ).start();

    let step = 0;
    const advance = () => {
      if (step >= STEPS.length) {
        Animated.timing(progress, { toValue: 1, duration: 400, useNativeDriver: false }).start(() =>
          setDone(true)
        );
        return;
      }
      setCurrentStep(step);
      Animated.timing(progress, {
        toValue: (step + 1) / STEPS.length,
        duration: 700,
        useNativeDriver: false,
      }).start();
      step++;
      setTimeout(advance, 850);
    };
    setTimeout(advance, 500);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const handleStart = async () => {
    await setOnboardingComplete(true);
    router.replace("/(tabs)/");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#07070E", "#0D0420"]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(139,92,246,0.15)", "transparent", "rgba(6,182,212,0.1)"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.inner,
          {
            opacity: fadeIn,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        {!done ? (
          <>
            <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
              <LinearGradient colors={["#8B5CF6", "#06B6D4"]} style={styles.spinnerGradient} />
            </Animated.View>
            <Text style={[styles.title, { color: colors.text }]}>
              Analyzing{"\n"}your profile
            </Text>
            <Text style={[styles.stepLabel, { color: colors.purple }]}>
              {STEPS[currentStep]?.label}...
            </Text>
            <View style={[styles.barBg, { backgroundColor: colors.surface }]}>
              <Animated.View style={[styles.barFill, { width: barWidth }]}>
                <LinearGradient
                  colors={["#8B5CF6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <View style={styles.steps}>
              {STEPS.map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor:
                          i < currentStep
                            ? colors.green + "22"
                            : i === currentStep
                            ? colors.purple + "22"
                            : colors.surface,
                      },
                    ]}
                  >
                    <Ionicons
                      name={i < currentStep ? "checkmark-circle" : (s.icon as any)}
                      size={16}
                      color={i < currentStep ? colors.green : i === currentStep ? colors.purple : colors.mutedForeground}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      {
                        color:
                          i < currentStep
                            ? colors.green
                            : i === currentStep
                            ? colors.text
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.doneArea}>
            <LinearGradient colors={["#8B5CF6", "#06B6D4"]} style={styles.doneIcon}>
              <Ionicons name="checkmark" size={48} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.doneTitle, { color: colors.text }]}>Your Plan is Ready!</Text>
            <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
              AI has created a personalized transformation plan just for you. Let's start your journey.
            </Text>
            <View style={styles.highlights}>
              {["Custom Workout Plan", "AI Nutrition Guide", "Body Transformation Preview"].map(
                (h, i) => (
                  <View key={i} style={[styles.highlightRow, { borderColor: colors.divider }]}>
                    <Ionicons name="sparkles" size={16} color={colors.purple} />
                    <Text style={[styles.highlightText, { color: colors.text }]}>{h}</Text>
                  </View>
                )
              )}
            </View>
            <GradientButton
              title="Enter FitMorph AI"
              onPress={handleStart}
              variant="primary"
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, alignItems: "center" },
  spinner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 32,
    overflow: "hidden",
  },
  spinnerGradient: { flex: 1, borderRadius: 50 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
  },
  barBg: {
    width: "100%",
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 32,
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  steps: { width: "100%", gap: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  doneArea: { alignItems: "center", flex: 1, justifyContent: "center", width: "100%", gap: 16 },
  doneIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  doneSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  highlights: { width: "100%", gap: 10 },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.08)",
  },
  highlightText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
