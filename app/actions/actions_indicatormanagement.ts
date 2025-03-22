"use server";

import { Indicator } from "@/types/goal.types";
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

  return availableIndicators;
}

export async function getAvailableIndicatorsNoSub(goalId: number) {
  const availableIndicators = await prisma.td_goal_indicator.findMany({
    include: {
      md_indicator: true,
    },
    where: {
      NOT: {
        goal_id: goalId,
      },
    },
  });

  return availableIndicators;
}

export async function createNewIndicator(indicator: Indicator, goalId: number) {
  const newIndicator = await prisma.md_indicator.create({
    data: {
      name: indicator.name,
      description: indicator.description,
      status: "active",
    },
  });

  const newGoalIndicator = await prisma.td_goal_indicator.create({
    data: {
      indicator_id: newIndicator.indicator_id,
      goal_id: goalId,
      global_target_value: indicator.global_target_value,
      global_baseline_value: indicator.global_baseline_value,
    },
  });

  await prisma.td_goal_indicator_required_data.createMany({
    data: indicator.required_data.map((req) => ({
      required_data_id: req.required_data_id,
      goal_indicator_id: newGoalIndicator.goal_indicator_id,
    })),
  });

  return {
    newIndicatorId: newIndicator.indicator_id,
    newGoalIndicatorId: newGoalIndicator.goal_indicator_id,
  };
}

export async function createNewMainSubIndicator(
  subIndicator: Indicator,
  parentIndicatorId: number,
  goalIndicatorId: number,
) {
  const newSubIndicator = await prisma.md_sub_indicator.create({
    data: {
      name: subIndicator.name,
      description: subIndicator.description,
      status: "pending",
      parent_indicator_id: parentIndicatorId,
    },
  });

  const newGoalSubIndicator = await prisma.td_goal_sub_indicator.create({
    data: {
      sub_indicator_id: newSubIndicator.sub_indicator_id,
      goal_indicator_id: goalIndicatorId,
      global_target_value: subIndicator.global_target_value,
      global_baseline_value: subIndicator.global_baseline_value,
    },
  });

  await prisma.td_goal_sub_indicator_required_data.createMany({
    data: subIndicator.required_data.map((req) => ({
      required_data_id: req.required_data_id,
      goal_sub_indicator_id: newGoalSubIndicator.goal_sub_indicator_id,
    })),
  });

  return newSubIndicator.sub_indicator_id;
}

export async function createNewSubSubIndicator(
  subIndicator: Indicator,
  parentIndicatorId: number,
  goalIndicatorId: number,
) {
  const newSubIndicator = await prisma.md_sub_indicator.create({
    data: {
      name: subIndicator.name,
      description: subIndicator.description,
      status: "pending",
      parent_sub_indicator_id: parentIndicatorId,
    },
  });

  const newGoalSubIndicator = await prisma.td_goal_sub_indicator.create({
    data: {
      sub_indicator_id: newSubIndicator.sub_indicator_id,
      goal_indicator_id: goalIndicatorId,
      global_target_value: subIndicator.global_target_value,
      global_baseline_value: subIndicator.global_baseline_value,
    },
  });

  await prisma.td_goal_sub_indicator_required_data.createMany({
    data: subIndicator.required_data.map((req) => ({
      required_data_id: req.required_data_id,
      goal_sub_indicator_id: newGoalSubIndicator.goal_sub_indicator_id,
    })),
  });

  return newSubIndicator.sub_indicator_id;
}
