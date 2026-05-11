import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#080C18",
          borderTopWidth: 1,
          borderTopColor: "rgba(99,120,255,0.18)",
          elevation: 0,
          height: isWeb ? 84 : 72,
          paddingBottom: isWeb ? 34 : 10,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint="dark" style={[StyleSheet.absoluteFill, { borderTopColor: "rgba(99,120,255,0.18)", borderTopWidth: 1 }]} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#080C18", borderTopColor: "rgba(99,120,255,0.18)", borderTopWidth: 1 }]} />
          ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginTop: 2,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "barbell" : "barbell-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.coachBtn, { backgroundColor: focused ? colors.purple : colors.surface, borderColor: focused ? colors.purple : colors.divider }]}>
              <Ionicons name="sparkles" size={20} color={focused ? "#FFF" : color} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "leaf" : "leaf-outline"} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  coachBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1.5,
  },
});
