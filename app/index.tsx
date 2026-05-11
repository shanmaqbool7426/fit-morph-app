import { Redirect } from "expo-router";
import { View } from "react-native";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { onboardingComplete, isLoading } = useApp();
  const colors = useColors();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/welcome" />;
}
