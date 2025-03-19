"use server";

import { GoalIndicator } from "@/types/goal.types";
import prisma from "@/utils/prisma";

export async function getAvailableIndicators(goalId: number) {
  const availableIndicators = await prisma.td_goal_indicator.findMany({
    include: {
      md_indicator: true,
      td_goal_sub_indicator: {
        include: {
          md_sub_indicator: true,
        },
      },
      td_goal_indicator_required_data: {
        include: {
          ref_required_data: true,
        },
      },
    },
    where: {
      NOT: {
        goal_id: goalId,
      },
    },
  });

  return availableIndicators as GoalIndicator[];
}

export async function createIndicator(formData: FormData) {
  const goalId = parseInt(formData.get("goalId") as string, 10);
  const indicatorsData = JSON.parse(formData.get("indicators") as string);

  console.log("Received indicators:", indicatorsData);

  if (!Array.isArray(indicatorsData) || indicatorsData.length === 0) {
    return {
      success: false,
      message: "❌ No indicators were added.",
      addedIndicators: [],
      duplicateIndicators: [],
    };
  }

  const indicator = await prisma.md_indicator.create({
    data: {
      name: formData.get("name") as string,
      goalId,
    },
  });
}
