"use server";

import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

// Types for the edit operations
interface EditIndicatorData {
  // Global properties (affects all goals)
  name: string;
  description: string;

  // Goal-specific properties (only affects this goal)
  global_target_value: number | null;
  global_baseline_value: number | null;
  baseline_year: number;
}

interface EditMainIndicatorParams {
  indicator_id: number;
  goal_indicator_id: number;
  data: EditIndicatorData;
}

interface EditSubIndicatorParams {
  sub_indicator_id: number;
  goal_sub_indicator_id: number;
  data: EditIndicatorData;
}

// Update Main Indicator (both global and goal-specific properties)
export async function updateMainIndicator({
  indicator_id,
  goal_indicator_id,
  data
}: EditMainIndicatorParams) {
  try {
    // Start a transaction to update both tables
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update global properties in md_indicator
      const updatedIndicator = await tx.md_indicator.update({
        where: {
          indicator_id: indicator_id
        },
        data: {
          name: data.name,
          description: data.description
        }
      });

      // 2. Update goal-specific properties in td_goal_indicator
      const updatedGoalIndicator = await tx.td_goal_indicator.update({
        where: {
          goal_indicator_id: goal_indicator_id
        },
        data: {
          global_target_value: data.global_target_value,
          global_baseline_value: data.global_baseline_value,
          baseline_year: data.baseline_year
        }
      });

      return {
        indicator: updatedIndicator,
        goalIndicator: updatedGoalIndicator
      };
    });

    // Revalidate the path to refresh the UI
    revalidatePath("/indicatormanagement");

    return {
      success: true,
      data: result,
      message: "Main indicator updated successfully"
    };

  } catch (error) {
    console.error("Error updating main indicator:", error);
    return {
      success: false,
      error: "Failed to update main indicator"
    };
  }
}

// Update Sub Indicator (both global and goal-specific properties)
export async function updateSubIndicator({
  sub_indicator_id,
  goal_sub_indicator_id,
  data
}: EditSubIndicatorParams) {
  try {
    // Start a transaction to update both tables
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update global properties in md_sub_indicator
      const updatedSubIndicator = await tx.md_sub_indicator.update({
        where: {
          sub_indicator_id: sub_indicator_id
        },
        data: {
          name: data.name,
          description: data.description
        }
      });

      // 2. Update goal-specific properties in td_goal_sub_indicator
      // First check if the goal_sub_indicator record exists
      const existingGoalSubIndicator = await tx.td_goal_sub_indicator.findUnique({
        where: {
          goal_sub_indicator_id: goal_sub_indicator_id
        }
      });

      let updatedGoalSubIndicator;

      if (existingGoalSubIndicator) {
        // Update existing record
        updatedGoalSubIndicator = await tx.td_goal_sub_indicator.update({
          where: {
            goal_sub_indicator_id: goal_sub_indicator_id
          },
          data: {
            global_target_value: data.global_target_value,
            global_baseline_value: data.global_baseline_value,
            baseline_year: data.baseline_year
          }
        });
      } else {
        // This shouldn't happen in normal flow, but handle it gracefully
        throw new Error("Goal sub-indicator relationship not found");
      }

      return {
        subIndicator: updatedSubIndicator,
        goalSubIndicator: updatedGoalSubIndicator
      };
    });

    // Revalidate the path to refresh the UI
    revalidatePath("/indicatormanagement");

    return {
      success: true,
      data: result,
      message: "Sub-indicator updated successfully"
    };

  } catch (error) {
    console.error("Error updating sub-indicator:", error);
    return {
      success: false,
      error: "Failed to update sub-indicator"
    };
  }
}

// Helper function to get indicator details for validation
export async function getIndicatorForEdit(indicator_id: number, type: 'main' | 'sub') {
  try {
    if (type === 'main') {
      const indicator = await prisma.md_indicator.findUnique({
        where: { indicator_id },
        include: {
          td_goal_indicator: true
        }
      });
      return { success: true, data: indicator };
    } else {
      const subIndicator = await prisma.md_sub_indicator.findUnique({
        where: { sub_indicator_id: indicator_id },
        include: {
          td_goal_sub_indicator: true
        }
      });
      return { success: true, data: subIndicator };
    }
  } catch (error) {
    console.error("Error fetching indicator:", error);
    return { success: false, error: "Failed to fetch indicator" };
  }
}
