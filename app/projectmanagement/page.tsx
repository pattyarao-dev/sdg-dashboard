import { IProject } from "@/types/project.types";
import { getProjectIndicators, getProjects } from "../actions/actions";
import Link from "next/link";

export default async function ProjectManagement() {
  const projectsList = await getProjects();
  const formatDate = (
    date: string | Date | null,
    dateType: "startDate" | "endDate",
  ) => {
    if (!date)
      return dateType === "startDate"
        ? "Start date not defined"
        : "End date not defined";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const projectIndicators = await getProjectIndicators();

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <div className="w-full p-6 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg drop-shadow-lg">
        <h1 className="text-2xl uppercase font-bold">Project Management</h1>
      </div>
      <div className="w-full flex flex-col gap-10">
        {projectsList.map((project, index) => (
          <div
            key={index}
            className="w-full p-6 border-2 border-gray-300 bg-white flex flex-col gap-10"
          >
            <div className="w-full flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-2xl uppercase font-semibold text-green-800">
                  {project.name}
                </p>
                <p className="text-sm italic text-gray-700">
                  {project.description}
                </p>
              </div>
              <div>
                {formatDate(project.startDate, "startDate")} -{" "}
                {formatDate(project.endDate, "endDate")}
              </div>
            </div>
            <div className="w-full flex flex-col gap-10">
              <div className="w-full flex flex-col gap-2">
                {project.projectIndicators.length > 0 ? (
                  <>
                    {project.projectIndicators.map((indicator, index) => (
                      <p key={index}>{indicator.indicatorName}</p>
                    ))}
                  </>
                ) : (
                  <p>This project has no indicators yet.</p>
                )}
              </div>
              <Link href={`/projectmanagement/${project.projectId}`}>
                <button className="w-1/4 py-2 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg">
                  Add Project Indicator
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
