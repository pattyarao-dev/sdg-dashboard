"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useProjects } from "@/context/ProjectContext";
import { ProjectStatus } from "@/context/ProjectContext";

const AddProject = () => {
  const { addProject } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleAddProject = () => {
    if (!name || !description) {
      alert("Please fill out all fields.");
      return;
    }

    const newProject = {
      name,
      description,
      status: ProjectStatus.Ongoing,
    };

    addProject(newProject);
    router.push("/project-management");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Add New Project</h1>

        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-black mb-4">Manage Your Projects</h2>

          {/* Add Project Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="project-name"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Enter the project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">
                Project Description
              </label>
              <textarea
                id="project-description"
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                placeholder="Describe the project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <button
              onClick={handleAddProject}
              className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
            >
              Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
