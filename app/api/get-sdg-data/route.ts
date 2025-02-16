import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const sdgs = await prisma.md_goal.findMany({
      include: {
        td_goal_indicator: {
          include: {
            md_indicator: {
              include: {
                md_sub_indicator: {
                  include: {
                    td_goal_sub_indicator: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the raw database data into the desired structure
    const transformedData = sdgs.map((goal) => {
      // Get target values from the first indicator (assumes consistency)
      const globalTargetValue = goal.td_goal_indicator[0]?.global_target_value ?? 0;

      // Aggregate goal-level current values (assuming global_baseline_value is the correct field)
      const globalCurrentValue = goal.td_goal_indicator.map((indicator) => ({
        year: new Date().getFullYear(), // Dynamic current year
        current: indicator.global_baseline_value ?? 0, // Using baseline as a stand-in for "current"
        target: globalTargetValue,
      }));

      const indicators = goal.td_goal_indicator.map((goalIndicator) => {
        const indicator = goalIndicator.md_indicator;

        // Extract direct indicator values
        const current: number[] = [goalIndicator.global_baseline_value ?? 0];
        const target: number[] = [goalIndicator.global_target_value ?? 0];

        // Process sub-indicators
        const subIndicators = indicator.md_sub_indicator.map((subIndicator) => {
          const subCurrent: number[] = [];
          const subTarget: number[] = [];

          subIndicator.td_goal_sub_indicator.forEach((subIndicatorData) => {
            subCurrent.push(subIndicatorData.global_baseline_value ?? 0);
            subTarget.push(subIndicatorData.global_target_value ?? 0);
          });

          return {
            name: subIndicator.name,
            current: subCurrent,
            target: subTarget,
          };
        });

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
