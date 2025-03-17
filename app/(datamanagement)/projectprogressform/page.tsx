import { getProjects } from "@/app/actions/actions";
import ProjectProgressFormComponent from "@/components/ProjectProgressFormComponent";

export default async function ProjectProgressForm() {
  const projectList = await getProjects();
  return (
    <main className="w-full min-h-screen p-10">
      <ProjectProgressFormComponent projectsList={projectList} />
    </main>
  );
}
