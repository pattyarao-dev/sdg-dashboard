"use server";

import { prisma } from "@/utils/prisma";
import {
  IGoalIndicatorSimple,
  IGoalSubIndicatorSimple,
  IGoalWithIndicators,
} from "@/types/indicator.types";
import { IProject } from "@/types/project.types";

export async function createProject(project: IProject) {
  console.log(typeof project.start_date);
  try {
    const newProject = await prisma.td_project.create({
      data: {
        name: project.name,
        description: project.description,
        start_date: new Date(project.start_date!),
        end_date: project.end_date ? new Date(project.end_date!) : null,
        project_status: "ongoing",
      },
    });
    console.log(newProject);
    return newProject;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function addProjectIndicators(
  indicators: IGoalIndicatorSimple[],
  projectId: number,
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Insert Indicators
      await tx.td_project_indicator.createMany({
        data: indicators.map((indicator) => ({
          project_id: projectId,
          goal_indicator_id: indicator.goal_indicator_id,
        })),
        skipDuplicates: true, // Prevent duplicate insertions
      });

      // Fetch inserted indicators to get their project_indicator_id
      const projectIndicators = await tx.td_project_indicator.findMany({
        where: { project_id: projectId },
        select: { project_indicator_id: true, goal_indicator_id: true },
      });

      // Map goal_indicator_id -> project_indicator_id
      const indicatorMap = new Map(
        projectIndicators.map((pi) => [
          pi.goal_indicator_id,
          pi.project_indicator_id,
        ]),
      );

      // Insert Sub-Indicators (if any)
      const subIndicatorsToInsert = indicators.flatMap((indicator) =>
        indicator.sub_indicators.map((sub) => ({
          project_indicator_id: indicatorMap.get(indicator.goal_indicator_id)!,
          sub_indicator_id: sub.goal_sub_indicator_id, // Assuming this maps to sub_indicator_id
        })),
      );

      if (subIndicatorsToInsert.length > 0) {
        await tx.td_project_sub_indicator.createMany({
          data: subIndicatorsToInsert,
          skipDuplicates: true,
        });
      }

      return true;
    });

    console.log("Indicators and Sub-Indicators added successfully");
    return result;
  } catch (error) {
    console.error("Error adding project indicators:", error);
    throw error;
  }
}

export async function getAllGoalIndicators() {
  try {
    const goalIndicators = await prisma.md_goal.findMany({
      include: {
        td_goal_indicator: {
          include: {
            md_indicator: true,
            td_goal_sub_indicator: {
              where: {
                md_sub_indicator: {
                  parent_indicator_id: {
                    not: null,
                  },
                },
              },
              include: {
                md_sub_indicator: true,
              },
            },
          },
        },
      },
      orderBy: { goal_id: "asc" },
    });
    const typedGoalIndicators = goalIndicators.map((goal) => {
      return {
        goal_id: goal.goal_id,
        name: goal.name,
        indicators:
          goal.td_goal_indicator.length > 0
            ? goal.td_goal_indicator.map((indicator) => {
              return {
                goal_indicator_id: indicator.goal_indicator_id,
                indicator_name: indicator.md_indicator.name,
                indicator_target: indicator.global_target_value,
                sub_indicators:
                  indicator.td_goal_sub_indicator.length > 0
                    ? indicator.td_goal_sub_indicator.map((subIndi) => {
                      return {
                        sub_indicator_id:
                          subIndi.md_sub_indicator.sub_indicator_id,
                        goal_sub_indicator_id:
                          subIndi.goal_sub_indicator_id,
                        indicator_name: subIndi.md_sub_indicator.name,
                        indicator_target: subIndi.global_target_value,
                        sub_indicators: [],
                      } as IGoalSubIndicatorSimple;
                    })
                    : [],
              } as IGoalIndicatorSimple;
            })
            : [],
      } as IGoalWithIndicators;
    });
    return typedGoalIndicators;
  } catch (error) {
    console.error("Error getting goal indicators:", error);
    throw error;
  }
}

export async function getBabyIndicator(subIndicatorId: number) {
  try {
    const subIndicators = await prisma.md_sub_indicator.findMany({
      where: {
        parent_sub_indicator_id: subIndicatorId,
      },
      include: {
        td_goal_sub_indicator: true,
      },
    });
    const typedSubIndicators = subIndicators.map((subIndi) => {
      return {
        indicator_name: subIndi.name,
        goal_sub_indicator_id:
          subIndi.td_goal_sub_indicator[0].goal_sub_indicator_id,
        indicator_target: subIndi.td_goal_sub_indicator[0].global_target_value,
        sub_indicator_id: subIndi.sub_indicator_id,
      } as IGoalSubIndicatorSimple;
    });

    console.log(typedSubIndicators);
    return typedSubIndicators;
  } catch (error) {
    console.error("Error getting goal indicators:", error);
    throw error;
  }
}
