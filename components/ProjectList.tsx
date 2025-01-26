"use client";

import { useProjects, ProjectStatus } from "@/context/ProjectContext";

type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
};

type ProjectListProps = {
  projects: Project[];
  onAction: (id: number) => void;
  actionText: string;
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAction, actionText }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">Name</th>
            <th className="py-2 px-4 border-b text-left text-gray-600 font-semibold">Description</th>
            <th className="py-2 px-4 border-b text-center text-gray-600 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="py-2 px-4 text-black border-b">{project.name}</td>
              <td className="py-2 px-4 text-black border-b">{project.description}</td>
              <td className="py-2 px-4 border-b text-center">
                {project.status === ProjectStatus.Ongoing && (
                  <button
                    onClick={() => onAction(project.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                  >
                    {actionText}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;
