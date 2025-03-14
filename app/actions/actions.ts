"use server";

import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";

export async function getProjects() {
  const projects = await prisma.td_project.findMany({
    include: {
      td_project_indicator: {
        include: {
          td_goal_indicator: {
            include: {
              md_indicator: {
                select: {
                  name: true,
                },
              },
            },
          },
          td_project_sub_indicator: {
            include: {
              md_sub_indicator: {
                select: {
                  sub_indicator_id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const processedProjects = projects.map((project) => ({
    projectId: project.project_id,
    name: project.name,
    description: project.description,
    status: project.project_status,
    startDate: project.start_date,
    endDate: project.end_date,

    projectIndicators: project.td_project_indicator.map((pi) => ({
      projectIndicatorId: pi.project_indicator_id,
      goalIndicatorId: pi.td_goal_indicator?.goal_indicator_id,
      indicatorName: pi.td_goal_indicator?.md_indicator.name,

      projectSubIndicators: pi.td_project_sub_indicator.map((psi) => ({
        projectSubIndicatorId: psi.project_sub_indicator_id,
        subIndicatorId: psi.md_sub_indicator.sub_indicator_id,
        subIndicatorName: psi.md_sub_indicator.name,
      })),
    })),
  }));

  return processedProjects;
}

export async function getProject(id: number) {
  const project = await prisma.td_project.findUnique({
    where: {
      project_id: id,
    },
    select: {
      project_id: true,
      name: true,
      description: true,
      project_status: true,
      start_date: true,
      end_date: true,
    },
  });
  return project;
}

// export async function getProjectIndicators(id: number){

// }

export async function getGoals() {
  const goals = await prisma.md_goal.findMany({
    include: {
      td_goal_indicator: {
        include: {
          md_indicator: true, // Get the indicator details
          td_indicator_value: true,
          td_goal_sub_indicator: {
            include: {
              md_sub_indicator: true, // Get only sub-indicators applicable to the goal
              td_sub_indicator_value: true,
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
          md_indicator: true,
          td_goal_sub_indicator: {
            include: {
              md_sub_indicator: true,
              td_goal_sub_indicator_required_data: {
                // Fetch sub-indicator required data
                include: {
                  ref_required_data: true,
                },
              },
              md_computation_rule: true,
            },
          },
          td_goal_indicator_required_data: {
            // Fetch indicator required data
            include: {
              ref_required_data: true,
            },
          },
          md_computation_rule: true,
        },
      },
    },
  });

  // Transform data for easier frontend use
  const processedGoals = goals.map((goal) => ({
    goalId: goal.goal_id,
    goalName: goal.name,
    indicators: goal.td_goal_indicator.map((gi) => ({
      goalIndicatorId: gi.goal_indicator_id,
      indicatorId: gi.md_indicator.indicator_id,
      indicatorName: gi.md_indicator.name,

      requiredData: gi.td_goal_indicator_required_data.map((rd) => ({
        requiredDataId: rd.ref_required_data.required_data_id,
        requiredDataName: rd.ref_required_data.name, // Ensure this name field is correct
      })),

      subIndicators: gi.td_goal_sub_indicator.map((gs) => ({
        goalSubIndicatorId: gs.goal_sub_indicator_id,
        subIndicatorId: gs.md_sub_indicator.sub_indicator_id,
        subIndicatorName: gs.md_sub_indicator.name,

        requiredData: gs.td_goal_sub_indicator_required_data.map((rd) => ({
          requiredDataId: rd.ref_required_data.required_data_id,
          requiredDataName: rd.ref_required_data.name, // Ensure this name field is correct
        })),

        subIndicatorComputationRule: gs.md_computation_rule.map((scr) => ({
          ruleId: scr.rule_id,
          ruleFormula: scr.formula,
        })),
      })),

      computationRule: gi.md_computation_rule.map((cr) => ({
        ruleId: cr.rule_id,
        ruleFormula: cr.formula,
      })),
    })),
  }));

  return processedGoals;
}

export async function updateIndicatorComputationRule(
  goalIndicatorId: number,
  formula: string,
) {
  try {
    const formulaTable = await prisma.md_computation_rule
      .create({
        data: {
          formula,
          goal_indicator_id: goalIndicatorId,
        },
      })
      .then()
      .catch((error) => {
        console.error(error);
      });
    return formulaTable;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
  }
}

export async function updateSubIndicatorComputationRule(
  goalSubIndicatorId: number,
  formula: string,
) {
  try {
    const formulaTable = await prisma.md_computation_rule
      .create({
        data: {
          formula,
          goal_sub_indicator_id: goalSubIndicatorId,
        },
      })
      .then()
      .catch((error) => {
        console.error(error);
      });
    return formulaTable;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
  }
}

export async function updateIndicatorRequiredDataValue(
  indicatorRequiredDataValues: Array<{
    goalIndicatorId: number;
    requiredDataId: number;
    value: number;
    createdBy: number;
  }>,
) {
  try {
    const updatedValues = await prisma.td_required_data_value.createMany({
      data: indicatorRequiredDataValues.map((data) => ({
        goal_indicator_id: data.goalIndicatorId,
        required_data_id: data.requiredDataId,
        value: data.value,
        created_by: data.createdBy,
      })),
    });
    return updatedValues;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
  }
}

export async function updateSubIndicatorRequiredDataValue(
  subIndicatorRequiredDataValues: Array<{
    goalIndicatorId: number;
    requiredDataId: number;
    value: number;
    createdBy: number;
  }>,
) {
  try {
    const updatedValues = await prisma.td_required_data_value.createMany({
      data: subIndicatorRequiredDataValues.map((data) => ({
        goal_sub_indicator_id: data.goalIndicatorId,
        required_data_id: data.requiredDataId,
        value: data.value,
        created_by: data.createdBy,
      })),
    });
    return updatedValues;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
  }
}

export async function getUserRoles() {
  try {
    const roles = await prisma.ref_user_type.findMany({
      select: {
        user_type_id: true,
        name: true,
      },
    });
    return roles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
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
          global_target_value: indicator.global_target_value ?? 0,
          global_baseline_value: indicator.global_baseline_value ?? 0,
        },
      });
      addedIndicators.push(indicator.name);
    } else {
      duplicateIndicators.push(indicator.name);
    }

    const goalIndicatorId = goalIndicator.goal_indicator_id;

    // 🆕 Process Required Data
    if (indicator.required_data && indicator.required_data.length > 0) {
      for (const requiredData of indicator.required_data) {
        let requiredDataId = requiredData.requiredDataId;

        if (requiredDataId < 0) {
          requiredDataId = undefined;
        }

        // Check if required data already exists
        let existingRequiredData = null;
        if (requiredDataId) {
          existingRequiredData = await prisma.ref_required_data.findUnique({
            where: { required_data_id: requiredDataId },
          });
        }

        // If not found, create it and let Prisma handle the ID
        if (!existingRequiredData) {
          const newRequiredData = await prisma.ref_required_data.create({
            data: {
              name: requiredData.name, // Assuming required_data has a 'name' field
            },
          });

          requiredDataId = newRequiredData.required_data_id; // Use the generated ID
        }

        // Link Required Data to Indicator
        await prisma.td_goal_indicator_required_data.upsert({
          where: {
            goal_indicator_id_required_data_id: {
              // Referencing the unique constraint
              goal_indicator_id: goalIndicatorId,
              required_data_id: requiredDataId,
            },
          },
          update: {}, // No update needed if it already exists
          create: {
            goal_indicator_id: goalIndicatorId,
            required_data_id: requiredDataId,
          },
        });
      }
    }

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
            global_target_value: subIndicator.global_target_value ?? 0,
            global_baseline_value: subIndicator.global_baseline_value ?? 0,
          },
        });

        if (
          subIndicator.required_data &&
          subIndicator.required_data.length > 0
        ) {
          for (const requiredData of subIndicator.required_data) {
            let requiredDataId = requiredData.requiredDataId;

            if (requiredDataId < 0) {
              requiredDataId = undefined;
            }

            // Check if required data already exists
            let existingRequiredData = null;
            if (requiredDataId) {
              existingRequiredData = await prisma.ref_required_data.findUnique({
                where: { required_data_id: requiredDataId },
              });
            }

            // If not found, create it and let Prisma handle the ID
            if (!existingRequiredData) {
              const newRequiredData = await prisma.ref_required_data.create({
                data: {
                  name: requiredData.name, // Assuming required_data has a 'name' field
                },
              });

              requiredDataId = newRequiredData.required_data_id; // Use the generated ID
            }

            const goalSubIndicator =
              await prisma.td_goal_sub_indicator.findFirst({
                where: {
                  goal_indicator_id: goalIndicatorId, // Ensure it's linked to the correct goal-indicator
                  sub_indicator_id: subIndicatorId,
                },
                select: { goal_sub_indicator_id: true },
              });

            if (!goalSubIndicator) {
              console.warn(
                `No goal_sub_indicator found for sub_indicator_id: ${subIndicatorId}`,
              );
              continue;
            }

            // Link Required Data to Sub-Indicator
            await prisma.td_goal_sub_indicator_required_data.upsert({
              where: {
                goal_sub_indicator_id_required_data_id: {
                  goal_sub_indicator_id: goalSubIndicator.goal_sub_indicator_id, // Reference sub-indicator
                  required_data_id: requiredDataId,
                },
              },
              update: {}, // No update needed if it already exists
              create: {
                goal_sub_indicator_id: goalSubIndicator.goal_sub_indicator_id,
                required_data_id: requiredDataId,
              },
            });
          }
        }
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
