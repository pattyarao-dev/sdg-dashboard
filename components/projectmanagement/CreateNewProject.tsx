"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IProject } from "@/types/project.types";
import { createProject } from "@/app/actions/actions_projectmanagement";
import { create } from "domain";

const CreateProject = () => {
  const [success, setSuccess] = useState(false);
  const [newProject, setNewProject] = useState<IProject>({
    project_id: Date.now(),
    name: "",
    description: "",
    start_date: null,
    end_date: null,
    project_status: "ongoing",
  });
  const [newProjectId, setNewProjectId] = useState<number | null>(null);

  const router = useRouter();

  const handleInputChange = (
    project: IProject,
    field: keyof IProject,
    value: string | Date,
  ) => {
    setNewProject({ ...project, [field]: value });
  };

  const handleSubmit = async () => {
    const project = await createProject(newProject);
    setSuccess(true);
    setNewProjectId(project.project_id);
  };

  return (
    <div className="w-full min-h-screen p-10 flex items-start justify-center">
      <div className="w-full h-full p-10 bg-white drop-shadow-lg flex flex-col gap-10">
        <div className="w-full flex flex-col gap-4">
          <h1 className="text-lg font-bold text-orange-500">
            Add a New Project
          </h1>
          <hr className="w-full border-2 border-orange-500" />
        </div>
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <p className="uppercase font-bold text-green-800">Project Name</p>
            <input
              type="text"
              placeholder="Project Name"
              className="w-full p-2 text-sm border border-gray-300"
              value={newProject.name}
              onChange={(e) =>
                handleInputChange(newProject, "name", e.target.value)
              }
            />
          </div>
          <div>
            <p className="uppercase font-bold text-green-800">
              Project Description
            </p>
            <input
              type="text"
              placeholder="Project Name"
              className="w-full p-2 text-sm border border-gray-300"
              value={newProject.description?.toString()}
              onChange={(e) =>
                handleInputChange(newProject, "description", e.target.value)
              }
            />
          </div>
          <div className="w-full flex items-center justify-between gap-6">
            <div className="w-1/2 flex flex-col gap-2">
              <p className="uppercase font-bold text-green-800">
                Project Start Date
              </p>
              <input
                type="date"
                placeholder="Project Start Date"
                className="w-full p-2 text-sm border border-gray-300"
                value={
                  newProject.start_date ? newProject.start_date.toString() : ""
                }
                onChange={(e) =>
                  handleInputChange(newProject, "start_date", e.target.value)
                }
              />
            </div>

            <div className="w-1/2 flex flex-col gap-2">
              <p className="uppercase font-bold text-green-800">
                Project End Date
              </p>
              <input
                type="date"
                placeholder="Project End Date"
                className="w-full p-2 text-sm border border-gray-300"
                value={
                  newProject.end_date ? newProject.end_date.toString() : ""
                }
                onChange={(e) =>
                  handleInputChange(newProject, "end_date", e.target.value)
                }
              />
            </div>
          </div>
        </div>
        {success ? (
          <button
            className="w-fit px-6 py-2 bg-gradient-to-r from-green-200 to-green-500 uppercase font-bold"
            onClick={() => router.push(`/projectmanagement/${newProjectId}`)}
          >
            Proceed to adding indicators
          </button>
        ) : (
          <button className="button-style" onClick={() => handleSubmit()}>
            Create Project
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateProject;
