import { getLocations, getProjects } from "@/app/actions/actions";
import ProjectProgressFormComponent from "@/components/ProjectProgressFormComponent";
import { IProjectProgressForm } from "@/types/project.types";

export default async function ProjectProgressForm() {
  const projectList = await getProjects();
  const locations = await getLocations();
  return (
    <main className="w-full min-h-screen p-10">
      <ProjectProgressFormComponent
        projectsList={projectList as unknown as IProjectProgressForm[]}
        locations={locations as unknown as { id: number; name: string }[]}
      />
    </main>
  );
}
