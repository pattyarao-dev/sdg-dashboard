import { IProjectProgressForm } from "@/types/project.types";
import EditProjectIndicatorValues from "@/components/EditProjectIndicatorValues";
import { ILocation } from "@/types/project.types";

interface IProjectWithLocations extends IProjectProgressForm {
  assignedLocations: ILocation[];
}

const ProjectProgressFormComponent = ({
  projectsList,
}: {
  projectsList: IProjectWithLocations[];
}) => {
  // Filter out completed projects
  const ongoingProjects = projectsList.filter(
    (project) => project.status !== "complete",
  );

  return (
    <div className="w-full flex flex-col gap-24">
      <div className="w-full flex flex-col gap-10">
        {ongoingProjects.length > 0 ? (
          ongoingProjects.map((project, index) => (
            <div
              key={index}
              className="w-full p-6 border-2 border-gray-300 bg-white flex flex-col gap-10"
            >
              <div className="w-full flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-2xl uppercase font-semibold text-green-800">
                    {project.name}
                  </p>
                </div>
              </div>
              <div className="w-full flex flex-col gap-10">
                <div className="w-full ">
                  {project.projectIndicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="w-full p-6 bg-gray-100 flex flex-col gap-4"
                    >
                      <p className="text-xl font-bold uppercase">
                        {indicator.indicatorName}
                      </p>
                      <EditProjectIndicatorValues
                        indicator={indicator}
                        assignedLocations={project.assignedLocations}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full p-6 text-center text-gray-500">
            <p>No ongoing projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectProgressFormComponent;
