import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGrad,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;
const PANEL_HEIGHT = 220;

const TIMELINE_POINTS = [
  {
    label: "Week 1",
    short: "W1",
    score: 74,
    fat: 22,
    muscle: 33,
    weight: 78,
  },
  {
    label: "Week 4",
    short: "W4",
    score: 77,
    fat: 21,
    muscle: 34,
    weight: 76.5,
  },
  {
    label: "Week 8",
    short: "W8",
    score: 80,
    fat: 19,
    muscle: 35,
    weight: 75.5,
  },
  {
    label: "Now",
    short: "Now",
    score: 82,
    fat: 18,
    muscle: 36,
    weight: 74.8,
  },
];

const METRICS = [
  {
    key: "score" as const,
    label: "Body Score",
    unit: "",
    higherIsBetter: true,
    color: "#22D3EE",
  },
  {
    key: "fat" as const,
    label: "Body Fat",
    unit: "%",
    higherIsBetter: false,
    color: "#EC4899",
  },
  {
    key: "muscle" as const,
    label: "Muscle Mass",
    unit: "kg",
    higherIsBetter: true,
    color: "#7C3AED",
  },
  {
    key: "weight" as const,
    label: "Weight",
    unit: "kg",
    higherIsBetter: false,
    color: "#F59E0B",
  },
];

function BodyScanSilhouette({
  glowColor,
  intensity,
  showGrid,
  dataPoints,
}: {
  glowColor: string;
  intensity: number;
  showGrid: boolean;
  dataPoints?: { x: number; y: number; label: string }[];
}) {
  return (
    <Svg width={100} height={170} viewBox="0 0 100 170">
      <Defs>
        <SvgGrad id={`bg${glowColor.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={glowColor} stopOpacity={intensity * 0.9} />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity={intensity * 0.5} />
        </SvgGrad>
      </Defs>

      {/* Grid overlay */}
      {showGrid &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <Line
            key={`h${i}`}
            x1="10"
            y1={30 + i * 25}
            x2="90"
            y2={30 + i * 25}
            stroke={glowColor}
            strokeWidth="0.5"
            opacity={0.3}
          />
        ))}
      {showGrid &&
        [0, 1, 2, 3].map((i) => (
          <Line
            key={`v${i}`}
            x1={20 + i * 20}
            y1="20"
            x2={20 + i * 20}
            y2="165"
            stroke={glowColor}
            strokeWidth="0.5"
            opacity={0.2}
          />
        ))}

      {/* Head */}
      <Circle
        cx="50"
        cy="20"
        r="13"
        fill="none"
        stroke={`url(#bg${glowColor.replace("#", "")})`}
        strokeWidth="1.5"
      />
      {/* Neck */}
      <Path
        d="M44 33 L44 40 L56 40 L56 33"
        fill="none"
        stroke={`url(#bg${glowColor.replace("#", "")})`}
        strokeWidth="1.2"
      />
      {/* Torso */}
      <Path
        d="M44 40 Q30 42 24 52 L22 90 Q22 96 28 96 L32 96 L32 68 L36 68 L36 108 L44 108 L44 76 L56 76 L56 108 L64 108 L64 68 L68 68 L68 96 L72 96 Q78 96 78 90 L76 52 Q70 42 56 40 Z"
        fill={glowColor + "12"}
        stroke={`url(#bg${glowColor.replace("#", "")})`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Legs */}
      <Path
        d="M36 108 L32 155 L42 155 L50 125 L58 155 L68 155 L64 108 Z"
        fill={glowColor + "08"}
        stroke={`url(#bg${glowColor.replace("#", "")})`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints?.map((dp, i) => (
        <React.Fragment key={i}>
          <Circle cx={dp.x} cy={dp.y} r="3" fill={glowColor} opacity={0.9} />
          <Circle cx={dp.x} cy={dp.y} r="6" fill={glowColor} opacity={0.2} />
        </React.Fragment>
      ))}
    </Svg>
  );
}

export function TransformationCard() {
  const colors = useColors();
  const [beforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(TIMELINE_POINTS.length - 1);
  const [sliderX, setSliderX] = useState(CARD_WIDTH / 2);
  const panRef = useRef<View>(null);
  const panWidth = CARD_WIDTH - 32;

  const beforeData = TIMELINE_POINTS[beforeIdx];
  const afterData = TIMELINE_POINTS[afterIdx];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const newX = Math.max(40, Math.min(panWidth - 40, sliderX + gs.dx));
      setSliderX(newX);
    },
    onPanResponderRelease: (_, gs) => {
      const newX = Math.max(40, Math.min(panWidth - 40, sliderX + gs.dx));
      setSliderX(newX);
    },
  });

  const splitRatio = sliderX / panWidth;
  const beforeWidth = Math.round(splitRatio * 100);
  const afterWidth = 100 - beforeWidth;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cyan + "30", borderRadius: colors.radius }]}>
      <LinearGradient
        colors={["rgba(34,211,238,0.08)", "rgba(124,58,237,0.06)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="scan-outline" size={15} color={colors.cyan} />
            <Text style={[styles.title, { color: colors.text }]}>Transformation Preview</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            AI body scan comparison · Drag to reveal
          </Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: colors.purple + "20", borderColor: colors.purple + "44" }]}>
          <Ionicons name="sparkles" size={11} color={colors.purpleLight} />
          <Text style={[styles.aiText, { color: colors.purpleLight }]}>AI</Text>
        </View>
      </View>

      {/* Timeline selector */}
      <Text style={[styles.compareLabel, { color: colors.mutedForeground }]}>
        COMPARE: <Text style={{ color: colors.cyan }}>{beforeData.label}</Text>
        {" → "}
        <Text style={{ color: colors.purple }}>{afterData.label}</Text>
      </Text>
      <View style={styles.timeline}>
        {TIMELINE_POINTS.map((tp, i) => {
          const isAfter = i === afterIdx;
          const isBefore = i === beforeIdx;
          return (
            <Pressable
              key={i}
              onPress={() => { if (i !== beforeIdx) setAfterIdx(i); }}
              style={[
                styles.timelineChip,
                {
                  backgroundColor: isAfter
                    ? colors.purple + "30"
                    : isBefore
                    ? colors.cyan + "20"
                    : colors.muted,
                  borderColor: isAfter
                    ? colors.purple
                    : isBefore
                    ? colors.cyan
                    : colors.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.timelineText,
                  {
                    color: isAfter
                      ? colors.purple
                      : isBefore
                      ? colors.cyan
                      : colors.mutedForeground,
                  },
                ]}
              >
                {tp.short}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Split comparison panel */}
      <View
        ref={panRef}
        style={[styles.comparePanel, { height: PANEL_HEIGHT, borderRadius: 12, borderColor: colors.divider }]}
        {...panResponder.panHandlers}
      >
        {/* Before side */}
        <View style={[styles.beforeSide, { width: `${beforeWidth}%` as any, backgroundColor: "#070B14" }]}>
          <LinearGradient
            colors={["rgba(34,211,238,0.06)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.scanBody}>
            <BodyScanSilhouette
              glowColor="#22D3EE"
              intensity={0.5}
              showGrid={false}
            />
          </View>
          <View style={[styles.sideLabel, styles.sideLabelLeft, { backgroundColor: "rgba(34,211,238,0.15)", borderColor: "#22D3EE44" }]}>
            <Text style={[styles.sideLabelText, { color: "#22D3EE" }]}>BEFORE</Text>
            <Text style={[styles.sideLabelSub, { color: "rgba(255,255,255,0.6)" }]}>{beforeData.label}</Text>
          </View>
          <View style={[styles.scoreOverlay, { left: 8 }]}>
            <Text style={[styles.overlayScore, { color: "#22D3EE" }]}>{beforeData.score}</Text>
            <Text style={[styles.overlayLabel, { color: "rgba(255,255,255,0.5)" }]}>score</Text>
          </View>
        </View>

        {/* After side */}
        <View style={[styles.afterSide, { width: `${afterWidth}%` as any, backgroundColor: "#0A0620" }]}>
          <LinearGradient
            colors={["rgba(124,58,237,0.1)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.scanBody}>
            <BodyScanSilhouette
              glowColor="#7C3AED"
              intensity={0.9}
              showGrid={true}
              dataPoints={[
                { x: 50, y: 65, label: "Core" },
                { x: 35, y: 80, label: "L" },
                { x: 65, y: 80, label: "R" },
              ]}
            />
          </View>
          <View style={[styles.sideLabel, styles.sideLabelRight, { backgroundColor: "rgba(124,58,237,0.15)", borderColor: "#7C3AED44" }]}>
            <Text style={[styles.sideLabelText, { color: "#A78BFA" }]}>AFTER</Text>
            <Text style={[styles.sideLabelSub, { color: "rgba(255,255,255,0.6)" }]}>{afterData.label}</Text>
          </View>
          <View style={[styles.scoreOverlay, { right: 8 }]}>
            <Text style={[styles.overlayScore, { color: "#A78BFA" }]}>{afterData.score}</Text>
            <Text style={[styles.overlayLabel, { color: "rgba(255,255,255,0.5)" }]}>score</Text>
          </View>
        </View>

        {/* Divider handle */}
        <View
          style={[styles.dividerHandle, { left: sliderX - 16, pointerEvents: "none" }]}
        >
          <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.7)" }]} />
          <LinearGradient
            colors={["#22D3EE", "#7C3AED"]}
            style={styles.handleBtn}
          >
            <Ionicons name="resize-outline" size={14} color="#FFF" />
          </LinearGradient>
          <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.7)" }]} />
        </View>
      </View>

      {/* Metrics delta */}
      <View style={styles.metricsGrid}>
        {METRICS.map((m) => {
          const before = beforeData[m.key];
          const after = afterData[m.key];
          const delta = Number((after - before).toFixed(1));
          const improved = m.higherIsBetter ? delta > 0 : delta < 0;
          const sign = delta > 0 ? "+" : "";

          return (
            <View
              key={m.key}
              style={[styles.metricItem, { backgroundColor: m.color + "10", borderColor: m.color + "28" }]}
            >
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
              <Text style={[styles.metricAfter, { color: m.color }]}>
                {after}{m.unit}
              </Text>
              <View style={[styles.deltaBadge, { backgroundColor: improved ? colors.green + "20" : colors.pink + "20" }]}>
                <Ionicons
                  name={improved ? "trending-up" : "trending-down"}
                  size={10}
                  color={improved ? colors.green : colors.pink}
                />
                <Text style={[styles.deltaText, { color: improved ? colors.green : colors.pink }]}>
                  {sign}{delta}{m.unit}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Upload CTA */}
      <Pressable
        style={[styles.uploadCTA, { borderColor: colors.purple + "44", backgroundColor: colors.purple + "10" }]}
      >
        <LinearGradient
          colors={[colors.purple + "15", colors.cyan + "08"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.uploadIcon, { backgroundColor: colors.purple + "25" }]}>
          <Ionicons name="camera-outline" size={18} color={colors.purple} />
        </View>
        <View style={styles.uploadText}>
          <Text style={[styles.uploadTitle, { color: colors.text }]}>Add Progress Photos</Text>
          <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
            Upload weekly shots for AI comparison & tracking
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: "hidden",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
  },
  compareLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  timeline: {
    flexDirection: "row",
    gap: 6,
  },
  timelineChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  timelineText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  comparePanel: {
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  beforeSide: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  afterSide: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBody: {
    alignItems: "center",
    justifyContent: "center",
  },
  sideLabel: {
    position: "absolute",
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  sideLabelLeft: { left: 8 },
  sideLabelRight: { right: 8 },
  sideLabelText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  sideLabelSub: {
    fontSize: 8,
    fontFamily: "Inter_400Regular",
  },
  scoreOverlay: {
    position: "absolute",
    bottom: 10,
    alignItems: "center",
  },
  overlayScore: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    fontWeight: "800",
  },
  overlayLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },
  dividerHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 32,
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  dividerLine: {
    width: 2,
    flex: 1,
    borderRadius: 1,
  },
  handleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricItem: {
    flex: 1,
    minWidth: "45%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metricAfter: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "800",
    lineHeight: 22,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  deltaText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  uploadCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  uploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: { flex: 1 },
  uploadTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  uploadSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 15,
  },
});
