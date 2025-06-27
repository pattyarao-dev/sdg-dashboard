import { getProjects } from "../actions/actions";
import Link from "next/link";
import ProjectStatusManager from "@/components/projectmanagement/ProjectStatusManager";

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

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "complete") {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800`;
  };

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <div className="w-full p-6 flex items-center justify-between bg-gradient-to-br from-green-50 to-orange-50 rounded-lg drop-shadow-lg">
        <h1 className="text-2xl uppercase font-bold">Project Management</h1>
        <button className="button-style">
          <Link href="/projectmanagement/createproject">Create Project</Link>
        </button>
      </div>
      <div className="w-full flex flex-col gap-10">
        {projectsList.map((project, index) => (
          <div
            key={index}
            className="w-full p-6 border-2 border-gray-300 bg-white flex flex-col gap-10"
          >
            <div className="w-full flex flex-col gap-4 items-start justify-between">
              <div className="w-full flex items-start justify-between">
                <div className="mb-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-2xl uppercase font-semibold text-green-800">
                      {project.name}
                    </p>
                    <span
                      className={getStatusBadge(project.status || "ongoing")}
                    >
                      {project.status || "ongoing"}
                    </span>
                  </div>
                  <p className="text-sm italic">{project.description}</p>
                </div>
                <ProjectStatusManager project={project} />
              </div>
              <hr className="w-full" />
              <div className="text-xs text-gray-800">
                {formatDate(project.startDate, "startDate")} -{" "}
                {formatDate(project.endDate, "endDate")}
              </div>
            </div>
            <div className="w-full flex flex-col gap-10">
              <div className="w-full flex flex-col gap-2">
                {project.projectIndicators &&
                project.projectIndicators.length > 0 ? (
                  <>
                    {project.projectIndicators.map((indicator, index) => (
                      <p key={index}>{indicator.indicatorName}</p>
                    ))}
                  </>
                ) : (
                  <p>This project has no indicators yet.</p>
                )}
              </div>
              {project.status !== "complete" ? (
                <Link href={`/projectmanagement/${project.projectId}`}>
                  <button className="w-1/4 py-2 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg hover:from-green-100 hover:to-orange-100 transition-colors">
                    Add Project Indicator
                  </button>
                </Link>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  Project is complete. No new indicators can be added.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
