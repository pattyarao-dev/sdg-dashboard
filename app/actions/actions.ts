"use server";

import prisma from "@/utils/prisma";

export async function getProjects() {
  const projects = await prisma.td_project.findMany({
    select: {
      project_id: true,
      name: true,
    },
  });
  return projects;
}

export async function getIndicators() {
  const indicators = await prisma.md_indicator.findMany({
    select: {
      indicator_id: true,
      name: true,
    },
  });
  return indicators;
}

export async function addIndicator(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Get all selected project IDs
  const projectIds = formData.getAll("projects") as string[];

  // Log the retrieved project IDs for debugging
  console.log("Selected project IDs:", projectIds);

  // Map project IDs to the expected format
  const projectRelations = projectIds.map((projectId) => ({
    project_id: parseInt(projectId, 10), // Convert string to number
  }));

  // Ensure the data is being processed correctly
  console.log("Mapped project relations:", projectRelations);

  // Create the indicator with associated projects
  await prisma.md_indicator.create({
    data: {
      name,
      description,
      status: "active",
      ref_project_indicator: {
        create: projectRelations, // Add multiple projects
      },
    },
  });
}

export async function addProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDate = new Date(formData.get("start_date") as string);
  const endDate = new Date(formData.get("end_date") as string);
  const indicators = formData.getAll("indicators") as string[];

  const newIndicatorName = formData.get("newIndicatorName") as string;
  const newIndicatorDescription = formData.get(
    "newIndicatorDescription",
  ) as string;

  let newIndicatorId: number | null = null;
  if (newIndicatorName && newIndicatorDescription) {
    const newIndicator = await prisma.md_indicator.create({
      data: {
        name: newIndicatorName,
        description: newIndicatorDescription,
        status: "active",
      },
    });
    newIndicatorId = newIndicator.indicator_id;
  }

  const allIndicatorIds = [...indicators.map((id) => parseInt(id, 10))];
  if (newIndicatorId !== null) {
    allIndicatorIds.push(newIndicatorId);
  }

  const projectIndicators = allIndicatorIds.map((indicatorId) => ({
    md_indicator: { connect: { indicator_id: indicatorId } },
  }));

  const project = await prisma.td_project.create({
    data: {
      name,
      description,
      project_status: "ongoing",
      start_date: startDate,
      end_date: endDate,
      ref_project_indicator: {
        create: projectIndicators,
      },
    },
  });

  return project;
}

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
