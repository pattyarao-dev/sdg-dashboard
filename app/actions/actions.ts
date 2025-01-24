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

export async function addIndicator(formData: FormData) {
  const projectIds = (formData.get("projects") as string)?.split(",") || [];
  await prisma.md_indicator.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: "active",
      ref_project_indicator: {
        create: projectIds.map((projectId) => ({
          td_project: { connect: { project_id: parseInt(projectId) } }, // Connect existing projects
        })),
      },
    },
  });
}
