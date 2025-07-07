import { getProject } from "@/app/actions/actions";
import ProjectDashboard from "../../../../components/dashboard/ProjectDashboard";

export default async function ProjectSpecificProgress({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const proj = await getProject(id);
  return <ProjectDashboard id={id} name={proj.name} />;
}
