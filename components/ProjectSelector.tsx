"use client";

import { useState } from "react";

interface ProjectProps {
  project_id: number;
  name: string;
}

interface ProjectSelectorProps {
  projects: ProjectProps[]; // Update to expect `projects` as a property
}

export default function ProjectSelector({ projects }: ProjectSelectorProps) {
  const [isDropdownShowed, setIsDropdownShowed] = useState(false);

  return (
    <div>
      <button onClick={() => setIsDropdownShowed((prevState) => !prevState)}>
        Select Relevant Projects
      </button>
      {isDropdownShowed && (
        <div>
          {projects.map((project) => (
            <div key={project.project_id}>
              <input type="checkbox" value={project.project_id} />
              <label>{project.name}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
