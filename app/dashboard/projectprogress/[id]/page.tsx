import ProjectDashboard from "../../../../components/dashboard/ProjectDashboard";

export default async function ProjectSpecificProgress({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  return (
    <ProjectDashboard id={id} />
  )
}
