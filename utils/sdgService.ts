import prisma from "@/utils/prisma";

/**
 * Fetch all SDG goals with their indicators and sub-indicators.
 * This function is used across multiple API routes to avoid redundant queries.
 */
export async function fetchSdgData() {
  return prisma.md_goal.findMany({
    include: {
      td_goal_indicator: {
        include: {
          md_indicator: {
            include: {
              md_sub_indicator: {
                include: {
                  td_goal_sub_indicator: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
