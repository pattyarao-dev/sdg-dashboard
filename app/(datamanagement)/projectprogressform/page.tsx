import { getLocations, getProjects } from "@/app/actions/actions";
import ProjectProgressFormComponent from "@/components/ProjectProgressFormComponent";

export default async function ProjectProgressForm() {
  const projectList = await getProjects();
  const locations = await getLocations();
  return (
    <main className="w-full min-h-screen p-10">
      <ProjectProgressFormComponent
        projectsList={projectList}
        locations={locations}
      />
    </main>
  );
}
