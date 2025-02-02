"use server";

import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";

export async function getProjects() {
  const projects = await prisma.td_project.findMany({
    select: {
      project_id: true,
      name: true,
    },
  });
  return projects;
}

// export async function getIndicators() {
//   const indicators = await prisma.md_indicator.findMany({
//     select: {
//       indicator_id: true,
//       name: true,
//       description: true, // Include the related `td_indicator_value` records
//     },
//   });
//   return indicators;
// }

export async function getGoals() {
  const goals = await prisma.md_goal.findMany({
    select: {
      goal_id: true,
      name: true,
      description: true,
      td_goal_indicator: {
        select: {
          md_indicator: {
            select: {
              indicator_id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });
  return goals;
}

export async function createIndicator(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const goalIdString = formData.get("goalNum") as string;
  const goalId = parseInt(goalIdString, 10);

  const targetValueString = formData.get("globalTarget") as string;
  const globalTargetValue = parseInt(targetValueString, 10);

  const baselineValueString = formData.get("globalBaseline") as string;
  const globalBaselineValue = parseInt(baselineValueString, 10);

  const currentValueString = formData.get("globalCurrent") as string;
  const globalCurrentValue = parseInt(currentValueString, 10);

  const newIndicator = await prisma.md_indicator.create({
    data: {
      name,
      description,
      status: "active",
    },
  });

  await prisma.td_goal_indicator.create({
    data: {
      goal_id: goalId,
      indicator_id: newIndicator.indicator_id,
      global_target_value: globalTargetValue,
      global_baseline_value: globalBaselineValue,
      global_current_value: globalCurrentValue,
    },
  });
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

  for (const indicator of indicatorsData) {
    let indicatorId = indicator.indicator_id;

    // 🔍 Check if the indicator already exists in the database
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

    // 🔍 Check if the goal-indicator relationship already exists
    const existingLink = await prisma.td_goal_indicator.findFirst({
      where: {
        goal_id: goalId,
        indicator_id: indicatorId,
      },
    });

    if (!existingLink) {
      await prisma.td_goal_indicator.create({
        data: {
          goal_id: goalId,
          indicator_id: indicatorId,
          global_target_value: indicator.target ?? 0,
          global_baseline_value: indicator.baseline ?? 0,
          global_current_value: indicator.current ?? 0,
        },
      });
      addedIndicators.push(indicator.name);
    } else {
      duplicateIndicators.push(indicator.name);
    }
  }

  console.log("Added:", addedIndicators);
  console.log("Duplicates:", duplicateIndicators);

  return {
    success: true,
    message:
      addedIndicators.length > 0
        ? "✅ Indicators successfully added."
        : "⚠️ Some indicators were already assigned.",
    addedIndicators,
    duplicateIndicators,
  };
}

// export async function addIndicator(formData: FormData) {
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const goals = formData.getAll("goals") as string[];

//   const indicatorGoals = goals.map((goalId) => ({
//     md_goal: { connect: { goal_id: parseInt(goalId, 10) } },
//   }));

//   // Create the indicator with associated projects
//   const indicator = await prisma.md_indicator.create({
//     data: {
//       name,
//       description,
//       status: "active",
//       ref_goal_indicator: {
//         create: indicatorGoals, // Add multiple projects
//       },
//     },
//   });

//   redirect("/indicatormanagement");
//   return indicator;
// }

// export async function addProject(formData: FormData) {
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const startDate = new Date(formData.get("start_date") as string);
//   const endDate = new Date(formData.get("end_date") as string);
//   const indicators = formData.getAll("indicators") as string[];

//   const newIndicatorName = formData.get("newIndicatorName") as string;
//   const newIndicatorDescription = formData.get(
//     "newIndicatorDescription",
//   ) as string;

//   let newIndicatorId: number | null = null;
//   if (newIndicatorName && newIndicatorDescription) {
//     const newIndicator = await prisma.md_indicator.create({
//       data: {
//         name: newIndicatorName,
//         description: newIndicatorDescription,
//         status: "active",
//       },
//     });
//     newIndicatorId = newIndicator.indicator_id;
//   }

//   const allIndicatorIds = [...indicators.map((id) => parseInt(id, 10))];
//   if (newIndicatorId !== null) {
//     allIndicatorIds.push(newIndicatorId);
//   }

//   const projectIndicators = allIndicatorIds.map((indicatorId) => ({
//     md_indicator: { connect: { indicator_id: indicatorId } },
//   }));

//   const project = await prisma.td_project.create({
//     data: {
//       name,
//       description,
//       project_status: "ongoing",
//       start_date: startDate,
//       end_date: endDate,
//       ref_project_indicator: {
//         create: projectIndicators,
//       },
//     },
//   });

//   redirect("/indicatormanagement");
//   return project;
// }

// export async function addProject(formData: FormData) {
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const startDate = new Date(formData.get("start_date") as string);
//   const endDate = new Date(formData.get("end_date") as string);

//   // Get all selected project IDs
//   const indicatorIds = formData.getAll("indicators") as string[];

//   // Log the retrieved project IDs for debugging
//   console.log("Selected project IDs:", indicatorIds);

//   // Map project IDs to the expected format
//   const projectRelations = indicatorIds.map((indicatorId) => ({
//     project_id: parseInt(indicatorId, 10), // Convert string to number
//   }));

//   // Ensure the data is being processed correctly
//   console.log("Mapped project relations:", projectRelations);

//   // Create the indicator with associated projects
//   await prisma.md_indicator.create({
//     data: {
//       name,
//       description,
//       project_status: "ongoing",
//       start_date: startDate,
//       end_date: endDate,
//       ref_project_indicator: {
//         create: projectRelations, // Add multiple projects
//       },
//     },
//   });
// }

// export async function addProject(formData: FormData) {
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const startDate = new Date(formData.get("start_date") as string);
//   const endDate = new Date(formData.get("end_date") as string);

//   // Extract selected indicators
//   const indicators = formData.getAll("selected_indicators[]") as string[];

//   // Process values for selected indicators
//   // const indicators = selectedIndicators.map((indicatorId) => ({
//   //   indicator_id: parseInt(indicatorId),
//   //   target_value:
//   //     parseFloat(
//   //       formData.get(`indicators[${indicatorId}][target_value]`) as string,
//   //     ) || null,
//   //   baseline_value:
//   //     parseFloat(
//   //       formData.get(`indicators[${indicatorId}][baseline_value]`) as string,
//   //     ) || null,
//   //   current_value:
//   //     parseFloat(
//   //       formData.get(`indicators[${indicatorId}][current_value]`) as string,
//   //     ) || null,
//   // }));

//   // Create the project and associate indicators with values
//   await prisma.td_project.create({
//     data: {
//       name,
//       description,
//       project_status: "ongoing",
//       start_date: startDate,
//       end_date: endDate,
//       ref_project_indicator: {
//         create: [{indicator_id: indicator}]
//       },
//       // td_indicator_value: {
//       //   create: indicators.map((indicator) => ({
//       //     indicator_id: indicator.indicator_id,
//       //     target_type: "project",
//       //     target_value: indicator.target_value,
//       //     baseline_value: indicator.baseline_value,
//       //     current_value: indicator.current_value,
//       //   })),
//       // },
//     },
//   });
// }
