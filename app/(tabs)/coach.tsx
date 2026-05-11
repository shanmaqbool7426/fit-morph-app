import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type ChatMessage } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const QUICK_CHIPS = [
  "Best exercises for abs?",
  "How much protein do I need?",
  "Give me a meal plan",
  "How to lose belly fat?",
  "Beginner workout tips",
];

const AI_RESPONSES: Record<string, string> = {
  protein:
    "For muscle gain, aim for 1.6–2.2g of protein per kg of bodyweight daily. That means if you weigh 70kg, target 112–154g/day. Great sources: chicken breast, eggs, Greek yogurt, lentils, paneer.",
  exercise:
    "For beginners I recommend compound movements: squats, push-ups, rows, and lunges. These work multiple muscle groups and give you the fastest results. Start with 3 sets of 10-12 reps.",
  abs:
    "To build visible abs: 1) Reduce body fat through diet and cardio. 2) Train abs 3x/week — planks, leg raises, crunches, cable crunches. 3) Stay consistent. Remember: abs are made in the kitchen!",
  meal:
    "Here's a sample plan for muscle gain:\n• Breakfast: Oats + protein powder + banana\n• Lunch: Chicken rice bowl + salad\n• Snack: Greek yogurt + almonds\n• Dinner: Daal + roti + vegetables\nAim for ~2400 kcal, 160g protein.",
  belly:
    "To lose belly fat: 1) Calorie deficit (300-500 below maintenance). 2) High protein diet (reduces hunger). 3) HIIT cardio 3x/week. 4) Sleep 7-9 hours. 5) Minimize sugary drinks. Consistency is key — results show in 8-12 weeks.",
  beginner:
    "Start with this beginner routine:\n• Mon: Push (chest, shoulders, triceps)\n• Wed: Pull (back, biceps)\n• Fri: Legs\n• Other days: rest or 20-min walk\n\nFocus on form, not weight. Track your workouts and eat enough protein. You've got this!",
  sleep:
    "Sleep is crucial for recovery and fat loss. During sleep, your body releases growth hormone to repair muscle. Aim for 7-9 hours. Tips: dark room, consistent schedule, avoid screens 1hr before bed.",
  motivation:
    "Every transformation starts with a single decision — the one you already made. On days when motivation is low, remember: discipline beats motivation. Show up, do the work, and trust the process. You're building the best version of yourself.",
  water:
    "Hydration is often overlooked but critical! Aim for 8-10 glasses (2-2.5L) daily. Water boosts metabolism, reduces hunger, and improves workout performance. Your FitMorph tracker shows you're at 5/8 glasses today — let's get those last 3 in!",
  supplement:
    "For most people, focus on whole foods first. If needed:\n• Whey protein: convenient protein source\n• Creatine: proven for strength and muscle\n• Vitamin D: most people are deficient\n• Omega-3: anti-inflammatory\nAlways consult a doctor before starting supplements.",
};

const DEFAULT_RESPONSES = [
  "That's a great question! Based on your profile and muscle gain goal, I'd recommend focusing on progressive overload — gradually increasing weights or reps each week. Small consistent improvements add up to massive results.",
  "I've analyzed your recent activity and nutrition logs. You're doing well with workouts, but your calorie intake could be 200-300 higher to support muscle growth. Try adding a pre-workout snack.",
  "Your body type responds well to higher training volume. Consider adding an extra set to your compound movements this week. Remember to rest 90 seconds between heavy sets for optimal recovery.",
  "Great progress this week! Your body score is improving steadily. Stay consistent with your nutrition — protein is the most important macro for your goal.",
  "Here's a tip: track your measurements weekly, not just weight. Muscle weighs more than fat, so the scale might not tell the full story. Focus on how your clothes fit and how you feel.",
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("protein") || lower.includes("whey")) return AI_RESPONSES.protein;
  if (lower.includes("abs") || lower.includes("six pack") || lower.includes("core")) return AI_RESPONSES.abs;
  if (lower.includes("meal") || lower.includes("diet") || lower.includes("eat")) return AI_RESPONSES.meal;
  if (lower.includes("belly") || lower.includes("fat loss") || lower.includes("lose weight")) return AI_RESPONSES.belly;
  if (lower.includes("beginner") || lower.includes("start") || lower.includes("new to")) return AI_RESPONSES.beginner;
  if (lower.includes("sleep") || lower.includes("rest") || lower.includes("recovery")) return AI_RESPONSES.sleep;
  if (lower.includes("motiv") || lower.includes("tired") || lower.includes("give up")) return AI_RESPONSES.motivation;
  if (lower.includes("water") || lower.includes("hydrat")) return AI_RESPONSES.water;
  if (lower.includes("supplement") || lower.includes("creatine") || lower.includes("vitamin")) return AI_RESPONSES.supplement;
  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("routine")) return AI_RESPONSES.exercise;
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && (
        <LinearGradient colors={["#8B5CF6", "#06B6D4"]} style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color="#FFF" />
        </LinearGradient>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.purple, borderBottomRightRadius: 4 }
            : {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
                borderWidth: 1,
                borderBottomLeftRadius: 4,
              },
        ]}
      >
        <Text
          style={[styles.bubbleText, { color: isUser ? "#FFF" : colors.text }]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, addMessage } = useApp();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(content),
        timestamp: Date.now(),
      };
      addMessage(aiMsg);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["rgba(139,92,246,0.10)", "transparent"]}
        style={styles.topGrad}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <LinearGradient colors={["#8B5CF6", "#06B6D4"]} style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>FitMorph Coach</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.dot, { backgroundColor: colors.green }]} />
              <Text style={[styles.onlineText, { color: colors.green }]}>AI Active</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={[...messages].reverse()}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={[
            styles.messages,
            { paddingTop: 16, paddingBottom: 8 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={styles.msgRow}>
                <LinearGradient colors={["#8B5CF6", "#06B6D4"]} style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#FFF" />
                </LinearGradient>
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                      borderWidth: 1,
                      borderBottomLeftRadius: 4,
                    },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: colors.mutedForeground }]}>
                    Analyzing...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick chips */}
        <View style={styles.chipsArea}>
          <FlatList
            data={QUICK_CHIPS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => c}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => sendMessage(item)}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.divider }]}
              >
                <Text style={[styles.chipText, { color: colors.mutedForeground }]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your AI coach..."
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.muted,
                borderRadius: 22,
              },
            ]}
            multiline
            onSubmitEditing={() => sendMessage()}
          />
          <Pressable
            onPress={() => sendMessage()}
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() ? colors.purple : colors.muted },
            ]}
          >
            <Ionicons name="arrow-up" size={18} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 150 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  messages: { paddingHorizontal: 16, flexGrow: 1, justifyContent: "flex-end" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  msgRowUser: { flexDirection: "row-reverse" },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  chipsArea: { paddingVertical: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
