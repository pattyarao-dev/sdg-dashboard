import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { fetchSdgData } from "@/utils/sdgService";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "");

    if (isNaN(year)) {
      return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
    }

    // Fetch all SDG goals with titles
    const allGoals = await fetchSdgData();

    // Aggregate indicator progress for the given year
    const aggregatedData = await prisma.td_indicator_value.groupBy({
      by: ["goal_indicator_id"],
      where: {
        measurement_date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _avg: { value: true },
      _count: { value: true },
    });

    // Fetch goal indicators along with their respective SDG goals
    const goalIndicators = await prisma.td_goal_indicator.findMany({
      include: { 
        md_goal: true,
        md_indicator: true,
      },
    });
    

    // Fetch indicators' target values
    const indicators = await prisma.td_goal_indicator.findMany({
      include: { 
        md_goal: true, 
        md_indicator: true,  // ✅ Now md_indicator is accessible
      },
    });
    
    const mappedProgress = goalIndicators.map((goal) => {
      const progress = aggregatedData.find((entry) => entry.goal_indicator_id === goal.goal_indicator_id);
    
      return {
        goal_id: goal.md_goal.goal_id,
        title: goal.md_goal.name,
        year,
        avg_progress: progress?._avg?.value ?? 0,
        data_entries: progress?._count?.value ?? 0,
        indicators: indicators
          .filter((indicator) => indicator.goal_id === goal.goal_id)
          .map((indicator) => ({
            name: indicator.md_indicator?.name || "Unknown Indicator", // ✅ No more TypeScript error
            current: [progress?._avg?.value ?? 0],
            target: indicator.global_target_value ?? 100,
          })),
      };
    });
    

    // Ensure every goal appears in the result, even if missing data
    const result = allGoals.map((goal) => {
      const progress = mappedProgress.find((p) => p.goal_id === goal.goal_id);
      return (
        progress || {
          goal_id: goal.goal_id,
          title: goal.name,
          year,
          avg_progress: 0,
          data_entries: 0,
          indicators: [],
        }
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching goal progress summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
