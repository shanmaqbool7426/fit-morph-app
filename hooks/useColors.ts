import colors from "@/constants/colors";

export function useColors() {
  return { ...(colors as any).dark, radius: colors.radius };
}
