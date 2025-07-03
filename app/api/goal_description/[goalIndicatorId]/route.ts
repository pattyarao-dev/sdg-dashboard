import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalIndicatorId: string }> },
) {
  try {
    const { goalIndicatorId: goalIndicatorIdParam } = await params;
    const goalIndicatorId = parseInt(goalIndicatorIdParam, 10);

    if (isNaN(goalIndicatorId)) {
      return NextResponse.json(
        { error: "Invalid goal indicator ID" },
        { status: 400 },
      );
    }

    const descriptions = await prisma.td_goal_indicator_description.findMany({
      where: {
        goal_indicator_id: goalIndicatorId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(descriptions);
  } catch (error) {
    console.error("Error fetching goal indicator descriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch descriptions" },
      { status: 500 },
    );
  }
}
