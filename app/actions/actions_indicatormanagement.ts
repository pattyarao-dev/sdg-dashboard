"use server";

import { Indicator } from "@/types/goal.types";
import prisma from "@/utils/prisma";

// export async function getAvailableIndicators(goalId: number) {
//   const availableIndicators = await prisma.td_goal_indicator.findMany({
//     include: {
//       md_indicator: true,
//       td_goal_sub_indicator: {
//         include: {
//           md_sub_indicator: true,
//         },
//       },
//       td_goal_indicator_required_data: {
//         include: {
//           ref_required_data: true,
//         },
//       },
//     },
//     where: {
//       NOT: {
//         goal_id: goalId,
//       },
//     },
//   });

//   return availableIndicators;
// }

export async function getAvailableIndicators(goalId: number) {
  // First get the main indicators not assigned to this goal
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

  // Fallback approach using regular Prisma queries (guaranteed to work)
  const getCompleteSubIndicatorHierarchy = async (indicatorId: number) => {
    // Get all direct sub-indicators for this indicator
    const directSubIndicators = await prisma.md_sub_indicator.findMany({
      where: {
        parent_indicator_id: indicatorId,
      },
    });

    // Recursively get sub-indicators for each direct sub-indicator
    const getSubIndicatorChildren = async (
      subIndicatorId: number,
    ): Promise<any[]> => {
      const children = await prisma.md_sub_indicator.findMany({
        where: {
          parent_sub_indicator_id: subIndicatorId,
        },
      });

      const childrenWithSubIndicators = await Promise.all(
        children.map(async (child) => ({
          indicator_id: child.sub_indicator_id, // Maintain consistency with your naming
          name: child.name,
          description: child.description,
          status: child.status,
          required_data: [], // Will be populated if needed
          sub_indicators: await getSubIndicatorChildren(child.sub_indicator_id),
        })),
      );

      return childrenWithSubIndicators;
    };

    // Build complete hierarchy
    const completeHierarchy = await Promise.all(
      directSubIndicators.map(async (subIndicator) => ({
        indicator_id: subIndicator.sub_indicator_id, // Maintain consistency
        name: subIndicator.name,
        description: subIndicator.description,
        status: subIndicator.status,
        required_data: [], // Will be populated if needed
        sub_indicators: await getSubIndicatorChildren(
          subIndicator.sub_indicator_id,
        ),
      })),
    );

    return completeHierarchy;
  };

  // Build complete hierarchy for each indicator
  const indicatorsWithCompleteHierarchy = await Promise.all(
    availableIndicators.map(async (indicator) => ({
      ...indicator,
      md_indicator: {
        ...indicator.md_indicator,
        sub_indicators: await getCompleteSubIndicatorHierarchy(
          indicator.md_indicator.indicator_id,
        ),
      },
    })),
  );

  return indicatorsWithCompleteHierarchy;
}

// Optional: If you want to try the CTE approach later, here's the fixed version
export async function getAvailableIndicatorsWithCTE(goalId: number) {
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

  // CTE approach with proper type casting
  const getCompleteSubIndicatorHierarchy = async (indicatorId: number) => {
    try {
      const result = await prisma.$queryRaw<
        Array<{
          sub_indicator_id: number;
          parent_indicator_id: number | null;
          parent_sub_indicator_id: number | null;
          name: string;
          description: string | null;
          status: string;
          level: number;
        }>
      >`
        WITH RECURSIVE sub_indicator_hierarchy AS (
          -- Base case: direct children of the main indicator
          SELECT
            si.sub_indicator_id,
            si.parent_indicator_id,
            si.parent_sub_indicator_id,
            si.name,
            si.description,
            si.status,
            0 as level
          FROM md_sub_indicator si
          WHERE si.parent_indicator_id = ${indicatorId}

          UNION ALL

          -- Recursive case: children of sub-indicators
          SELECT
            si.sub_indicator_id,
            si.parent_indicator_id,
            si.parent_sub_indicator_id,
            si.name,
            si.description,
            si.status,
            sih.level + 1
          FROM md_sub_indicator si
          INNER JOIN sub_indicator_hierarchy sih
            ON si.parent_sub_indicator_id = sih.sub_indicator_id
          WHERE sih.level < 10  -- Prevent infinite recursion
        )
        SELECT
          sub_indicator_id,
          parent_indicator_id,
          parent_sub_indicator_id,
          name,
          description,
          status,
          level
        FROM sub_indicator_hierarchy
        ORDER BY level, name;
      `;

      return buildHierarchyFromFlat(result, indicatorId);
    } catch (error) {
      console.error(
        "CTE query failed, falling back to regular queries:",
        error,
      );
      // Fallback to regular approach if CTE fails
      return getCompleteSubIndicatorHierarchyFallback(indicatorId);
    }
  };

  // Helper function to build nested structure from flat hierarchy result
  const buildHierarchyFromFlat = (flatData: any[], indicatorId: number) => {
    const idToNode = new Map();
    const roots: any[] = [];

    // First pass: create all nodes
    flatData.forEach((item) => {
      idToNode.set(item.sub_indicator_id, {
        indicator_id: item.sub_indicator_id,
        name: item.name,
        description: item.description,
        status: item.status,
        level: item.level,
        sub_indicators: [],
        required_data: [],
      });
    });

    // Second pass: build hierarchy
    flatData.forEach((item) => {
      const node = idToNode.get(item.sub_indicator_id);
      if (
        item.parent_indicator_id === indicatorId &&
        item.parent_sub_indicator_id === null
      ) {
        // This is a direct child of main indicator
        roots.push(node);
      } else if (item.parent_sub_indicator_id !== null) {
        // This is a child of another sub-indicator
        const parent = idToNode.get(item.parent_sub_indicator_id);
        if (parent) {
          parent.sub_indicators.push(node);
        }
      }
    });

    return roots;
  };

  // Fallback function using regular Prisma queries
  const getCompleteSubIndicatorHierarchyFallback = async (
    indicatorId: number,
  ) => {
    const directSubIndicators = await prisma.md_sub_indicator.findMany({
      where: {
        parent_indicator_id: indicatorId,
      },
    });

    const getSubIndicatorChildren = async (
      subIndicatorId: number,
    ): Promise<any[]> => {
      const children = await prisma.md_sub_indicator.findMany({
        where: {
          parent_sub_indicator_id: subIndicatorId,
        },
      });

      const childrenWithSubIndicators = await Promise.all(
        children.map(async (child) => ({
          indicator_id: child.sub_indicator_id,
          name: child.name,
          description: child.description,
          status: child.status,
          required_data: [],
          sub_indicators: await getSubIndicatorChildren(child.sub_indicator_id),
        })),
      );

      return childrenWithSubIndicators;
    };

    const completeHierarchy = await Promise.all(
      directSubIndicators.map(async (subIndicator) => ({
        indicator_id: subIndicator.sub_indicator_id,
        name: subIndicator.name,
        description: subIndicator.description,
        status: subIndicator.status,
        required_data: [],
        sub_indicators: await getSubIndicatorChildren(
          subIndicator.sub_indicator_id,
        ),
      })),
    );

    return completeHierarchy;
  };

  // Build complete hierarchy for each indicator
  const indicatorsWithCompleteHierarchy = await Promise.all(
    availableIndicators.map(async (indicator) => ({
      ...indicator,
      md_indicator: {
        ...indicator.md_indicator,
        sub_indicators: await getCompleteSubIndicatorHierarchy(
          indicator.md_indicator.indicator_id,
        ),
      },
    })),
  );

  return indicatorsWithCompleteHierarchy;
}

// Optional: Add this helper function for flattened dropdown options
export async function getAvailableIndicatorsFlattened(goalId: number) {
  const availableIndicators = await getAvailableIndicators(goalId);

  const flattenSubIndicators = (subIndicators: any[], level = 1): any[] => {
    let flattened: any[] = [];

    subIndicators.forEach((subIndicator) => {
      flattened.push({
        ...subIndicator,
        level,
        display_name: "  ".repeat(level) + "→ " + subIndicator.name,
        indent: "  ".repeat(level),
      });

      if (
        subIndicator.sub_indicators &&
        subIndicator.sub_indicators.length > 0
      ) {
        flattened = flattened.concat(
          flattenSubIndicators(subIndicator.sub_indicators, level + 1),
        );
      }
    });

    return flattened;
  };

  return availableIndicators.map((indicator) => ({
    ...indicator,
    flattened_sub_indicators: flattenSubIndicators(
      indicator.md_indicator.sub_indicators || [],
    ),
  }));
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
  // create new required data list where it's new only
  const newRequiredDataClient = indicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = indicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];

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
    data: completeRequiredData.map((req) => ({
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
  // create new required data list where it's new only
  const newRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];
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
    data: completeRequiredData.map((req) => ({
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
  // create new required data list where it's new only
  const newRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];
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
    data: completeRequiredData.map((req) => ({
      required_data_id: req.required_data_id,
      goal_sub_indicator_id: newGoalSubIndicator.goal_sub_indicator_id,
    })),
  });

  return newSubIndicator.sub_indicator_id;
}

export async function CreateOldMainSubIndicatorRelationship(
  subIndicator: Indicator,
  parentIndicatorId: number,
  goalIndicatorId: number,
) {
  console.log(parentIndicatorId)
  // create new required data list where it's new only
  const newRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];
  const newGoalSubIndicator = await prisma.td_goal_sub_indicator.create({
    data: {
      sub_indicator_id: subIndicator.indicator_id,
      goal_indicator_id: goalIndicatorId,
      global_target_value: subIndicator.global_target_value,
      global_baseline_value: subIndicator.global_baseline_value,
    },
  });


  await prisma.td_goal_sub_indicator_required_data.createMany({
    data: completeRequiredData.map((req) => ({
      required_data_id: req.required_data_id,
      goal_sub_indicator_id: newGoalSubIndicator.goal_sub_indicator_id,
    })),
  });

  return subIndicator.indicator_id;
}

export async function createOldSubIndicatorRelationship(
  subIndicator: Indicator,
  parentIndicatorId: number,
  goalIndicatorId: number,
) {
  console.log(parentIndicatorId)
  // create new required data list where it's new only
  const newRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = subIndicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];
  const newGoalSubIndicator = await prisma.td_goal_sub_indicator.create({
    data: {
      sub_indicator_id: subIndicator.indicator_id,
      goal_indicator_id: goalIndicatorId,
      global_target_value: subIndicator.global_target_value,
      global_baseline_value: subIndicator.global_baseline_value,
    },
  });

  await prisma.td_goal_sub_indicator_required_data.createMany({
    data: completeRequiredData.map((req) => ({
      required_data_id: req.required_data_id,
      goal_sub_indicator_id: newGoalSubIndicator.goal_sub_indicator_id,
    })),
  });

  return subIndicator.indicator_id
}

export async function createMainOldIndicatorGoal(indicator: Indicator, goalId: number) {

  // create new required data list where it's new only
  const newRequiredDataClient = indicator.required_data.filter(
    (req) => req.newRD,
  );
  const oldRequiredDataClient = indicator.required_data.filter(
    (req) => req.newRD === false,
  );

  const newRequiredDataPromises = newRequiredDataClient.map((req) =>
    prisma.ref_required_data.create({
      data: { name: req.name },
    }),
  );

  const newRequiredData = await Promise.all(newRequiredDataPromises);

  const completeRequiredData = [...newRequiredData, ...oldRequiredDataClient];
  const newGoalIndicator = await prisma.td_goal_indicator.create({
    data: {
      indicator_id: indicator.indicator_id,
      goal_id: goalId,
      global_target_value: indicator.global_target_value,
      global_baseline_value: indicator.global_baseline_value,
    },
  });

  await prisma.td_goal_indicator_required_data.createMany({
    data: completeRequiredData.map((req) => ({
      required_data_id: req.required_data_id,
      goal_indicator_id: newGoalIndicator.goal_indicator_id,
    })),
  });

  return {
    newIndicatorId: indicator.indicator_id,
    newGoalIndicatorId: newGoalIndicator.goal_indicator_id,
  };
}
