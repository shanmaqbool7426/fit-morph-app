import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, Line, LinearGradient as SvgLinearGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

function BodySilhouette() {
  return (
    <Svg width={160} height={260} viewBox="0 0 160 260">
      <Defs>
        <SvgLinearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7" />
        </SvgLinearGradient>
        <SvgLinearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
        </SvgLinearGradient>
      </Defs>
      {/* Glow base */}
      <Ellipse cx="80" cy="200" rx="55" ry="20" fill="#7C3AED" opacity="0.18" />
      {/* Body fill */}
      <Path
        d="M80 10 C68 10 60 20 60 30 C60 42 68 50 80 50 C92 50 100 42 100 30 C100 20 92 10 80 10 Z"
        fill="url(#bodyGrad)"
        opacity="0.15"
      />
      {/* Head outline */}
      <Circle cx="80" cy="30" r="20" fill="none" stroke="url(#bodyGrad)" strokeWidth="1.5" />
      {/* Neck */}
      <Path d="M73 50 L73 62 L87 62 L87 50" fill="none" stroke="url(#bodyGrad)" strokeWidth="1.5" />
      {/* Shoulders */}
      <Path d="M73 62 Q55 64 45 78 L45 120 Q45 126 51 126 L56 126 L56 100 L60 100 L60 158 L70 158 L70 118 L90 118 L90 158 L100 158 L100 100 L104 100 L104 126 L109 126 Q115 126 115 120 L115 78 Q105 64 87 62 Z"
        fill="url(#glowGrad)" stroke="url(#bodyGrad)" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Legs */}
      <Path d="M60 158 L56 230 L70 230 L80 190 L90 230 L104 230 L100 158 Z"
        fill="url(#glowGrad)" stroke="url(#bodyGrad)" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Scan lines */}
      <Line x1="40" y1="90" x2="120" y2="90" stroke="#22D3EE" strokeWidth="0.6" opacity="0.4" />
      <Line x1="40" y1="110" x2="120" y2="110" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" />
      <Line x1="40" y1="130" x2="120" y2="130" stroke="#22D3EE" strokeWidth="0.6" opacity="0.4" />
      <Line x1="45" y1="150" x2="115" y2="150" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" />
      <Line x1="50" y1="170" x2="110" y2="170" stroke="#22D3EE" strokeWidth="0.6" opacity="0.4" />
      <Line x1="50" y1="195" x2="110" y2="195" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" />
      {/* Data points */}
      <Circle cx="80" cy="90" r="3" fill="#22D3EE" opacity="0.8" />
      <Circle cx="56" cy="110" r="2" fill="#7C3AED" opacity="0.9" />
      <Circle cx="104" cy="130" r="2" fill="#22D3EE" opacity="0.9" />
      <Circle cx="80" cy="30" r="3" fill="#22D3EE" opacity="0.6" />
    </Svg>
  );
}

const FEATURES = [
  { icon: "scan-outline" as const, label: "AI Body Scan", color: "#22D3EE" },
  { icon: "barbell-outline" as const, label: "Smart Workouts", color: "#7C3AED" },
  { icon: "leaf-outline" as const, label: "Nutrition AI", color: "#10B981" },
  { icon: "trending-up-outline" as const, label: "Progress Track", color: "#EC4899" },
  { icon: "chatbubble-ellipses-outline" as const, label: "AI Coach", color: "#F59E0B" },
  { icon: "trophy-outline" as const, label: "Body Scoring", color: "#7C3AED" },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#080C18", "#0D0B28", "#080C18"]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(124,58,237,0.2)", "transparent", "rgba(34,211,238,0.12)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top corner glow */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />

      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
      }]}>
        {/* Brand header */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <LinearGradient colors={["#7C3AED", "#22D3EE"]} style={styles.logoBox}>
              <Ionicons name="fitness" size={18} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>FitMorph <Text style={{ color: colors.cyan }}>AI</Text></Text>
              <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>AI-Powered Fitness Transformation</Text>
            </View>
          </View>
          <View style={[styles.versionBadge, { borderColor: colors.purple + "44", backgroundColor: colors.purple + "15" }]}>
            <Text style={[styles.versionText, { color: colors.purpleLight }]}>v2.0</Text>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          {/* Left info panel */}
          <View style={styles.heroLeft}>
            <View style={[styles.scanCard, { backgroundColor: colors.surface, borderColor: colors.cyan + "44" }]}>
              <Text style={[styles.scanLabel, { color: colors.mutedForeground }]}>BODY SCORE</Text>
              <Text style={[styles.scanScore, { color: colors.cyan }]}>82</Text>
              <View style={[styles.scanBar, { backgroundColor: colors.muted }]}>
                <LinearGradient colors={["#22D3EE", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.scanFill, { width: "82%" }]} />
              </View>
              <Text style={[styles.scanStatus, { color: colors.green }]}>● Good</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>FAT %</Text>
              <Text style={[styles.metricVal, { color: colors.text }]}>18%</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>MUSCLE</Text>
              <Text style={[styles.metricVal, { color: colors.purple }]}>36 kg</Text>
            </View>
          </View>

          {/* Center body */}
          <Animated.View style={[styles.bodyContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(34,211,238,0.1)", "transparent"]}
              style={styles.bodyGlow}
            />
            <BodySilhouette />
            <Animated.View style={[styles.scanLine, {
              backgroundColor: colors.cyan,
              transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-130, 130] }) }],
            }]} />
          </Animated.View>

          {/* Right info panel */}
          <View style={styles.heroRight}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>BMI</Text>
              <Text style={[styles.metricVal, { color: colors.cyan }]}>22.4</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>LEVEL</Text>
              <Text style={[styles.metricVal, { color: colors.text }]}>Inter.</Text>
            </View>
            <View style={[styles.aiCard, { backgroundColor: colors.purple + "18", borderColor: colors.purple + "44" }]}>
              <Ionicons name="sparkles" size={14} color={colors.purple} />
              <Text style={[styles.aiText, { color: colors.purpleLight }]}>AI Ready</Text>
            </View>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.headlineMain}>Your AI Journey{"\n"}<Text style={{ color: colors.cyan }}>Starts Now</Text></Text>
          <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
            Transform your body with AI-powered analysis, personalized workouts & smart nutrition.
          </Text>
        </View>

        {/* Feature grid */}
        <View style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureItem, { backgroundColor: colors.surface, borderColor: f.color + "30" }]}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "18" }]}>
                <Ionicons name={f.icon} size={16} color={f.color} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <GradientButton
            title="Get Started →"
            onPress={() => router.push("/onboarding/goal")}
            variant="primary"
            size="lg"
          />
          <Pressable onPress={() => router.push("/onboarding/goal")} style={styles.signInRow}>
            <Text style={[styles.signInText, { color: colors.mutedForeground }]}>
              Already a member? <Text style={{ color: colors.cyan, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowTopLeft: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(124,58,237,0.18)",
  },
  glowTopRight: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(34,211,238,0.12)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  brandSub: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  versionText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    maxHeight: 260,
  },
  heroLeft: { gap: 8, alignItems: "center", width: 72 },
  heroRight: { gap: 8, alignItems: "center", width: 72 },
  scanCard: {
    width: 70,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  scanLabel: { fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  scanScore: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" },
  scanBar: { height: 3, borderRadius: 2, overflow: "hidden" },
  scanFill: { height: "100%", borderRadius: 2 },
  scanStatus: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  metricCard: {
    width: 70,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  metricLabel: { fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginBottom: 2 },
  metricVal: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  aiCard: {
    width: 70,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
  },
  aiText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  bodyContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bodyGlow: {
    position: "absolute",
    width: 200,
    height: 280,
    borderRadius: 100,
  },
  scanLine: {
    position: "absolute",
    width: 140,
    height: 1.5,
    opacity: 0.6,
    borderRadius: 1,
  },
  headline: { gap: 6 },
  headlineMain: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    letterSpacing: -0.8,
    lineHeight: 32,
    textAlign: "center",
  },
  headlineSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    textAlign: "center",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cta: { gap: 10, paddingBottom: 8 },
  signInRow: { alignItems: "center", paddingVertical: 4 },
  signInText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
