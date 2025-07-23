import { getProject } from "@/app/actions/actions";
import ProjectDashboard from "../../../../components/dashboard/ProjectDashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function ProjectSpecificProgress({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const proj = await getProject(id);
  const session = await getServerSession(authOptions)
  return <ProjectDashboard id={id} name={proj.name} session={session} />;
}
