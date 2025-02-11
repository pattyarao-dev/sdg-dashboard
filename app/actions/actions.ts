"use server";

import prisma from "@/utils/prisma";
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

// export async function createIndicator(formData: FormData) {
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const goalIdString = formData.get("goalNum") as string;
//   const goalId = parseInt(goalIdString, 10);

//   const targetValueString = formData.get("globalTarget") as string;
//   const globalTargetValue = parseInt(targetValueString, 10);

//   const baselineValueString = formData.get("globalBaseline") as string;
//   const globalBaselineValue = parseInt(baselineValueString, 10);

//   const currentValueString = formData.get("globalCurrent") as string;
//   const globalCurrentValue = parseInt(currentValueString, 10);

//   const newIndicator = await prisma.md_indicator.create({
//     data: {
//       name,
//       description,
//       status: "active",
//     },
//   });

//   await prisma.td_goal_indicator.create({
//     data: {
//       goal_id: goalId,
//       indicator_id: newIndicator.indicator_id,
//       global_target_value: globalTargetValue,
//       global_baseline_value: globalBaselineValue,
//       global_current_value: globalCurrentValue,
//     },
//   });
// }

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
          global_current_value: indicator.current ?? 0,
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
            global_current_value: subIndicator.current ?? 0,
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
