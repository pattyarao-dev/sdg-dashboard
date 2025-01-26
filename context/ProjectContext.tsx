"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export enum ProjectStatus {
  Ongoing = "ongoing",
  Complete = "complete",
}

export type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
};

type ProjectContextType = {
  projects: Project[];
  addProject: (newProject: Omit<Project, "id">) => void;
  updateProjectStatus: (id: number, status: ProjectStatus) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [idCounter, setIdCounter] = useState(1);

  const addProject = (newProject: Omit<Project, "id">) => {
    const id = idCounter;
    setProjects([...projects, { ...newProject, id }]);
    setIdCounter(id + 1);
  };

  const updateProjectStatus = (id: number, status: ProjectStatus) => {
    setProjects((prev) =>
        prev.map((ind) => (ind.id === id ? { ...ind, status } : ind))
      );
  };  

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProjectStatus }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
