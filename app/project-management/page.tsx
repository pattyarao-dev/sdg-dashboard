"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProjectList from "@/components/ProjectList";
import { useProjects, ProjectStatus } from "@/context/ProjectContext"; 

const ProjectManagement = () => {
  const { projects, updateProjectStatus } = useProjects();
  const router = useRouter();
  const [activeList, setActiveList] = useState(true);

  const ongoingProjects = projects.filter((project) => project.status === ProjectStatus.Ongoing);
  const completeProjects = projects.filter((project) => project.status === ProjectStatus.Complete);

  const handleAction = (id: number, newStatus: ProjectStatus.Ongoing | ProjectStatus.Complete) => {
    const project = projects.find((project) => project.id === id);
    if (!project) return;

    if (newStatus === ProjectStatus.Ongoing && project.status === ProjectStatus.Complete) {
      return;
    }

    updateProjectStatus(id, newStatus);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-7">
        <h1 className="text-2xl font-semibold mb-6">Project Management</h1>

        {/* Add Project Button */}
        <button
          onClick={() => router.push("/add-project")}
          className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md"
        >
          + Add Project
        </button>

        {/* Toggle Tabs */}
        <div className="mt-6 mb-4 flex gap-6">
          <span
            onClick={() => setActiveList(true)}
            className={`cursor-pointer text-m font-semibold ${
              activeList ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            Ongoing ({ongoingProjects.length})
          </span>

          <span
            onClick={() => setActiveList(false)}
            className={`cursor-pointer text-m font-semibold ${
              !activeList ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            Completed ({completeProjects.length})
          </span>
        </div>

        {/* Project List */}
        {activeList ? (
          <ProjectList
            projects={ongoingProjects}
            onAction={(id) => handleAction(id, ProjectStatus.Complete)}
            actionText="Complete"
          />
        ) : (
          <ProjectList
            projects={completeProjects}
            onAction={() => {}}
            actionText=""
          />
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
