import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulse = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 18, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.9, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#07070E", "#12003A", "#00142E"]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(139,92,246,0.18)", "transparent", "rgba(6,182,212,0.12)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.glowCircle,
          { transform: [{ scale: pulse }], top: height * 0.05 },
        ]}
      >
        <LinearGradient
          colors={["rgba(139,92,246,0.4)", "rgba(6,182,212,0.2)"]}
          style={{ flex: 1, borderRadius: 300 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <View style={styles.logoArea}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <View style={styles.brandRow}>
            <Text style={[styles.brand, { color: colors.text }]}>FitMorph</Text>
            <LinearGradient
              colors={["#8B5CF6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiBadge}
            >
              <Text style={styles.aiText}>AI</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Your AI Body Transformation Journey
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <LinearGradient colors={f.colors} style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={16} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <GradientButton
            title="Start Your Transformation"
            onPress={() => router.push("/onboarding/goal")}
            variant="primary"
            size="lg"
          />
          <Pressable style={styles.signIn} onPress={() => router.push("/onboarding/goal")}>
            <Text style={[styles.signInText, { color: colors.mutedForeground }]}>
              Already a member?{" "}
              <Text style={{ color: colors.purple }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.divider }]}>
            Trusted by 50,000+ transformations worldwide
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const FEATURES = [
  { icon: "scan-outline", colors: ["#8B5CF6", "#7C3AED"], text: "AI body scan & analysis" },
  { icon: "barbell-outline", colors: ["#06B6D4", "#0284C7"], text: "Personalized workout plans" },
  { icon: "nutrition-outline", colors: ["#10B981", "#059669"], text: "Smart nutrition guidance" },
  { icon: "trending-up-outline", colors: ["#EC4899", "#BE185D"], text: "Track your transformation" },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowCircle: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 300,
    alignSelf: "center",
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  logoArea: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  brand: {
    fontSize: 38,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  aiText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  features: {
    gap: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    gap: 12,
  },
  signIn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  signInText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
