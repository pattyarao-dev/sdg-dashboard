import { IProjectProgressForm } from "@/types/project.types";
import EditProjectIndicatorValues from "@/components/EditProjectIndicatorValues";

const ProjectProgressFormComponent = ({
  projectsList,
}: {
  projectsList: IProjectProgressForm[];
}) => {
  return (
    <div className="w-full flex flex-col gap-24">
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
              </div>
            </div>
            <div className="w-full flex flex-col gap-10">
              <div className="w-full ">
                {project.projectIndicators.length > 0 ? (
                  <div className="w-full flex flex-col gap-4">
                    {project.projectIndicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="w-full p-6 bg-gray-100 flex flex-col gap-4"
                      >
                        <p className="text-xl font-bold uppercase">
                          {indicator.indicatorName}
                        </p>
                        <EditProjectIndicatorValues indicator={indicator} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>This project has no indicators yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectProgressFormComponent;
