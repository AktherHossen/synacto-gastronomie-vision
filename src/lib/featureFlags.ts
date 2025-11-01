export const featureFlags = {
  starter: ["basic_orders"],
  pro: ["basic_orders", "floor_plan", "kitchen_display"],
  enterprise: ["basic_orders", "floor_plan", "kitchen_display", "multi_terminal", "advanced_reports"]
};

export function hasFeature(tier: "starter" | "pro" | "enterprise", feature: string): boolean {
  return featureFlags[tier]?.includes(feature);
} 