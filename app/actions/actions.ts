"use server";

import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";

export async function getProjects() {
  const projects = await prisma.td_project.findMany({
    select: {
      project_id: true,
      name: true,
    },
  });
  return projects;
}

export async function getGoals() {
  const goals = await prisma.md_goal.findMany({
    include: {
      td_goal_indicator: {
        include: {
          md_indicator: true, // Get the indicator details
          td_goal_sub_indicator: {
            include: {
              md_sub_indicator: true, // Get only sub-indicators applicable to the goal
            },
          },
        },
      },
    },
  });

  return goals;
}

export async function getGoalsInformation() {
  const goals = await prisma.md_goal.findMany({
    include: {
      td_goal_indicator: {
        include: {
          md_indicator: true, // Get the indicator details
          td_goal_sub_indicator: {
            include: {
              md_sub_indicator: true, // Get only sub-indicators applicable to the goal
            },
          },
        },
      },
    },
  });

  const processedGoals = goals.map((goal) => ({
    goalId: goal.goal_id,
    goalName: goal.name,
    indicators: goal.td_goal_indicator.map((gi) => ({
      indicatorId: gi.md_indicator.indicator_id,
      indicatorName: gi.md_indicator.name,
      subIndicators: gi.td_goal_sub_indicator.map((gs) => ({
        subIndicatorId: gs.md_sub_indicator.sub_indicator_id,
        subIndicatorName: gs.md_sub_indicator.name,
      })),
    })),
  }));

  return processedGoals;
}

export async function createIndicatorsBatch(formData: FormData) {
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

  const addedIndicators: string[] = [];
  const duplicateIndicators: string[] = [];
  const addedSubIndicators: string[] = [];

  for (const indicator of indicatorsData) {
    let indicatorId = indicator.indicator_id;

    // 🔍 Check if the indicator already exists
    const existingIndicator = await prisma.md_indicator.findUnique({
      where: { name: indicator.name },
    });

    if (existingIndicator) {
      indicatorId = existingIndicator.indicator_id;
    } else {
      const newIndicator = await prisma.md_indicator.create({
        data: {
          name: indicator.name,
          description: indicator.description ?? "",
          status: "active",
        },
      });
      indicatorId = newIndicator.indicator_id;
    }

    // 🔍 Get or create goal-indicator relationship
    let goalIndicator = await prisma.td_goal_indicator.findFirst({
      where: {
        goal_id: goalId,
        indicator_id: indicatorId,
      },
    });

    if (!goalIndicator) {
      goalIndicator = await prisma.td_goal_indicator.create({
        data: {
          goal_id: goalId,
          indicator_id: indicatorId,
          global_target_value: indicator.target ?? 0,
          global_baseline_value: indicator.baseline ?? 0,
        },
      });
      addedIndicators.push(indicator.name);
    } else {
      duplicateIndicators.push(indicator.name);
    }

    const goalIndicatorId = goalIndicator.goal_indicator_id;

    // Process Sub-Indicators
    if (indicator.sub_indicators && indicator.sub_indicators.length > 0) {
      for (const subIndicator of indicator.sub_indicators) {
        let subIndicatorId = subIndicator.sub_indicator_id;

        // Check if the sub-indicator already exists under this indicator
        const existingSubIndicator = await prisma.md_sub_indicator.findFirst({
          where: {
            name: subIndicator.name,
            parent_indicator_id: indicatorId, // Ensure it's the correct foreign key
          },
        });

        if (existingSubIndicator) {
          subIndicatorId = existingSubIndicator.sub_indicator_id;
        } else {
          // Create new sub-indicator
          const newSubIndicator = await prisma.md_sub_indicator.create({
            data: {
              name: subIndicator.name,
              status: "active",
              parent_indicator_id: indicatorId, // Ensure it's correctly linked
            },
          });
          subIndicatorId = newSubIndicator.sub_indicator_id;
          addedSubIndicators.push(subIndicator.name);
        }

        // Link sub-indicator to the goal-indicator relationship
        await prisma.td_goal_sub_indicator.upsert({
          where: {
            goal_indicator_id_sub_indicator_id: {
              goal_indicator_id: goalIndicatorId,
              sub_indicator_id: subIndicatorId,
            },
          },
          update: {}, // No update needed
          create: {
            goal_indicator_id: goalIndicatorId,
            sub_indicator_id: subIndicatorId,
            global_target_value: subIndicator.target ?? 0,
            global_baseline_value: subIndicator.baseline ?? 0,
          },
        });
      }
    }
  }

  console.log("Added Indicators:", addedIndicators);
  console.log("Duplicate Indicators:", duplicateIndicators);
  console.log("Added Sub-Indicators:", addedSubIndicators);

  return {
    success: true,
    message:
      addedIndicators.length > 0 || addedSubIndicators.length > 0
        ? "✅ Indicators and Sub-Indicators successfully added."
        : "⚠️ Some indicators or sub-indicators were already assigned.",
    addedIndicators,
    duplicateIndicators,
    addedSubIndicators,
  };
}

export async function updateValues(formData: FormData) {
  const auth = await getServerSession(authOptions);

  if (!auth?.user) {
    throw new Error("Unauthorized");
  }

  const created_by = Number(auth.user.id);
  const goal_indicator_id_raw = formData.get("goalIndicatorId");

  if (!goal_indicator_id_raw) {
    throw new Error("goalIndicatorId is missing from formData.");
  }

  const goal_indicator_id = parseInt(goal_indicator_id_raw as string, 10);

  if (isNaN(goal_indicator_id)) {
    throw new Error("Invalid goalIndicatorId received.");
  }

  // ✅ Process Indicator Values
  const indicatorEntries = formData.getAll("indicatorValues") as string[];
  const indicatorPromises = indicatorEntries.map(async (entry) => {
    try {
      const { indicator_id, value, notes } = JSON.parse(entry);

      return prisma.td_indicator_value.create({
        data: {
          goal_indicator_id,
          indicator_id,
          value: parseFloat(value),
          measurement_date: new Date(),
          notes,
          created_by,
        },
      });
    } catch (error) {
      console.error("Error parsing indicator entry:", entry, error);
    }
  });

  // ✅ Process Sub-Indicator Values
  const subIndicatorEntries = formData.getAll("subIndicatorValues") as string[];
  const subIndicatorPromises = subIndicatorEntries.map(async (entry) => {
    try {
      const { sub_indicator_id, value, notes } = JSON.parse(entry);

      const goalSubIndicator = await prisma.td_goal_sub_indicator.findFirst({
        where: {
          goal_indicator_id,
          sub_indicator_id,
        },
        select: { goal_sub_indicator_id: true },
      });

      if (!goalSubIndicator) {
        console.warn(
          `No goal_sub_indicator found for sub_indicator_id: ${sub_indicator_id}`,
        );
        return null;
      }

      return prisma.td_sub_indicator_value.create({
        data: {
          goal_sub_indicator_id: goalSubIndicator.goal_sub_indicator_id,
          sub_indicator_id,
          value: parseFloat(value),
          measurement_date: new Date(),
          notes,
          created_by,
        },
      });
    } catch (error) {
      console.error("Error parsing sub-indicator entry:", entry, error);
    }
  });

  // ✅ Run all operations concurrently for better performance
  await Promise.all([...indicatorPromises, ...subIndicatorPromises]);

  console.log("Values updated successfully.");
}

export async function updateBaselineValues(formData: FormData) {
  try {
    // Extract FormData entries
    const goalIndicatorsEntries = formData.getAll("goalIndicators");
    const goalSubIndicatorsEntries = formData.getAll("goalSubIndicators");

    // Convert FormData values to JSON
    const goalIndicators = goalIndicatorsEntries.map((entry) =>
      JSON.parse(entry as string),
    );
    const goalSubIndicators = goalSubIndicatorsEntries.map((entry) =>
      JSON.parse(entry as string),
    );

    // Update goal indicators
    await Promise.all(
      goalIndicators.map(({ indicator_id, value }) =>
        prisma.td_goal_indicator.updateMany({
          where: { indicator_id },
          data: { global_baseline_value: value },
        }),
      ),
    );

    // Update goal sub-indicators
    await Promise.all(
      goalSubIndicators.map(({ sub_indicator_id, value }) =>
        prisma.td_goal_sub_indicator.updateMany({
          where: { sub_indicator_id },
          data: { global_baseline_value: value },
        }),
      ),
    );

    console.log("Baseline values updated successfully");
  } catch (error) {
    console.error("Error in updateBaselineValues:", error);
  }
}
