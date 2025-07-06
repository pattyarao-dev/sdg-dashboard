import { getProjects } from "@/app/actions/actions";
import ProjectProgressFormComponent from "@/components/ProjectProgressFormComponent";
import { getProjectLocations } from "@/app/actions/actions_projectmanagement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function ProjectProgressForm() {
  const projectList = await getProjects();
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.userTypeId;
  console.log(userRole);

  const projectsWithLocations = await Promise.all(
    projectList.map(async (project) => {
      const assignedLocations = await getProjectLocations(project.projectId);
      return { ...project, assignedLocations };
    }),
  );
  return (
    <>
      {userRole === 1 || userRole === 3 ? (
        <main className="w-full min-h-screen p-10">
          <ProjectProgressFormComponent projectsList={projectsWithLocations} />
        </main>
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <p>You are not authorized to view this page.</p>
        </div>
      )}
    </>
  );
}
