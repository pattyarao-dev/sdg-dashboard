import { getProjects } from "@/app/actions/actions";
import ProjectProgressFormComponent from "@/components/ProjectProgressFormComponent";
import { getProjectLocations } from "@/app/actions/actions_projectmanagement";

export default async function ProjectProgressForm() {
  const projectList = await getProjects();

  const projectsWithLocations = await Promise.all(
    projectList.map(async (project) => {
      const assignedLocations = await getProjectLocations(project.projectId);
      return { ...project, assignedLocations };
    }),
  );
  return (
    <main className="w-full min-h-screen p-10">
      <ProjectProgressFormComponent projectsList={projectsWithLocations} />
    </main>
  );
}
