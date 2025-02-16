import { NextResponse } from "next/server";
import { fetchSdgData } from "@/utils/sdgService";

export async function GET() {
  try {
    const sdgs = await fetchSdgData();

    // Transform the raw database data into the desired structure
    const transformedData = sdgs.map((goal) => {
      const globalTargetValue = goal.td_goal_indicator[0]?.global_target_value ?? 0;

      const globalCurrentValue = goal.td_goal_indicator.map((indicator) => ({
        year: new Date().getFullYear(), // Dynamic current year
        current: indicator.global_baseline_value ?? 0,
        target: globalTargetValue,
      }));

      const indicators = goal.td_goal_indicator.map((goalIndicator) => {
        const indicator = goalIndicator.md_indicator;
        const current = [goalIndicator.global_baseline_value ?? 0];
        const target = [goalIndicator.global_target_value ?? 0];

        const subIndicators = indicator.md_sub_indicator.map((subIndicator) => ({
          name: subIndicator.name,
          current: subIndicator.td_goal_sub_indicator.map((sub) => sub.global_baseline_value ?? 0),
          target: subIndicator.td_goal_sub_indicator.map((sub) => sub.global_target_value ?? 0),
        }));

        return {
          name: indicator.name,
          current,
          target,
          sub_indicators: subIndicators,
        };
      });

      return {
        goal_id: goal.goal_id,
        title: goal.name,
        global_target_value: globalTargetValue,
        global_current_value: globalCurrentValue,
        indicators,
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching SDG data:", error);
    return NextResponse.json({ error: "Failed to fetch SDG data" }, { status: 500 });
  }
}
