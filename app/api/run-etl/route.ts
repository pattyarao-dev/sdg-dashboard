import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const year = parseInt(url.searchParams.get("year") || "");

        if (isNaN(year)) {
            return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
        }

        // Get all goals (even those without indicators)
        const allGoals = await prisma.md_goal.findMany({
            select: { goal_id: true },
        });

        // Aggregate goal progress from indicator values
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

        // Fetch corresponding goal details
        const goalDetails = await prisma.td_goal_indicator.findMany({
            include: { md_goal: true },
        });

        // Map aggregated results with goal details
        const mappedProgress = goalDetails.map((goal) => {
            const progress = aggregatedData.find((entry) => entry.goal_indicator_id === goal.goal_indicator_id);
            
            return {
                goal_id: goal.md_goal.goal_id,
                year,
                avg_progress: progress?._avg?.value ?? 0, // Handle missing values
                data_entries: progress?._count?.value ?? 0,
            };
        });

        // Ensure every goal appears in the result, even if there's no data
        const result = allGoals.map((goal) => {
            const progress = mappedProgress.find((p) => p.goal_id === goal.goal_id);
            return progress || { goal_id: goal.goal_id, year, avg_progress: 0, data_entries: 0 };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching goal progress summary:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
