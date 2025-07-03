import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalIndicatorId, explanation } = await request.json();
    console.log((session.user as any).id);
    const newDescription = await prisma.td_goal_indicator_description.create({
      data: {
        goal_indicator_id: goalIndicatorId,
        explanation: explanation,
        created_by: Number((session.user as any).id),
      },
    });

    return NextResponse.json(newDescription);
  } catch (error) {
    const e = error as Error;
    console.log(e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
