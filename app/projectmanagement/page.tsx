import { IProject } from "@/types/project.types";
import { getProjects } from "../actions/actions";

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

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <div className="w-full p-6 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg drop-shadow-lg">
        <h1 className="text-2xl uppercase">Project Management</h1>
      </div>
      <div className="w-full flex flex-col gap-10">
        {projectsList.map((project: IProject, index) => (
          <div
            key={index}
            className="w-full p-6 border-2 border-gray-300 bg-white flex flex-col gap-4"
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
                {formatDate(project.start_date, "startDate")} -{" "}
                {formatDate(project.end_date, "endDate")}
              </div>
            </div>
            <div>Project indicators go here.</div>
          </div>
        ))}
      </div>
    </main>
  );
}
