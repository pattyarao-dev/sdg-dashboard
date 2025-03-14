import { getProjects } from "@/app/actions/actions";
import AddProjectIndicator from "@/components/AddProjectIndicator";
import GoBackButton from "@/components/GoBackButton";
import prisma from "@/utils/prisma";

export default async function ManageProjectIndicators({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const idNum = Number(id);

  const project = await prisma.td_project.findUnique({
    where: { project_id: idNum },
    select: { 
      name: true,
      td_project_indicator: {
        select: {
          indicator_id: true
        }
      }
    },
  });

  // Get all available indicators (both regular and those tied to goals)
  const availableIndicators = await prisma.md_indicator.findMany({
    where: {
      // Filter out indicators already added to this project
      NOT: {
        indicator_id: {
          in: project?.td_project_indicator.map(pi => pi.indicator_id) || []
        }
      },
      status: "active"
    },
    select: {
      indicator_id: true,
      name: true,
      description: true,
      md_sub_indicator: {
        where: { status: "active" },
        select: {
          sub_indicator_id: true,
          name: true,
        },
      },
      // Include relation to goal indicators to show which are tied to SDGs
      td_goal_indicator: {
        select: {
          goal_indicator_id: true,
          md_goal: {
            select: {
              goal_id: true,
              name: true
            }
          }
        }
      }
    },
  });

  // Get all required data options
  const requiredData = await prisma.ref_required_data.findMany({
    select: {
      required_data_id: true,
      name: true,
    },
  });

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">
          Manage Indicators for: {project?.name}
        </h1>
        <p className="text-gray-600 mb-8">
          Add indicators to track progress for this project. You can add project-specific indicators 
          or link to existing SDG indicators.
        </p>
        
        <AddProjectIndicator
          projectId={id}
          projectName={project?.name}
          indicators={availableIndicators}
          requiredData={requiredData}
        />
      </div>
    </div>
  );
}