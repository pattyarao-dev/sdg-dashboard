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
      const globalTargetValue = goal.td_goal_indicator[0]?.global_target_value ?? 0;
      const globalCurrentValue = goal.td_goal_indicator.map((indicator) => ({
        year: 2020 + goal.goal_id, // Using goal_id as a placeholder for years, modify logic if needed
        current: indicator.global_current_value ?? 0,
        target: globalTargetValue,
      }));

      const indicators = goal.td_goal_indicator.map((goalIndicator) => {
        const indicator = goalIndicator.md_indicator;

        // Use goalIndicator's values directly
        const current: number[] = [goalIndicator.global_current_value ?? 0];
        const target: number[] = [goalIndicator.global_target_value ?? 0];

        // Process sub-indicators
        const subIndicators = indicator.md_sub_indicator.map((subIndicator) => {
          const subCurrent: number[] = [];
          const subTarget: number[] = [];

          subIndicator.td_goal_sub_indicator.forEach((subIndicatorData) => {
            subCurrent.push(subIndicatorData.global_current_value ?? 0);
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
