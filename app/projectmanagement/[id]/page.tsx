import { getProject, getUnassignedIndicators } from "@/app/actions/actions";

export default async function AddProjectIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;

  const project = await getProject(Number(id));
  const unassignedIndicators = await getUnassignedIndicators(Number(id));

  return (
    <main className="w-full min-h-screen p-10 flex flex-col gap-10">
      <p className="text-3xl font-bold uppercase text-green-800">
        {project?.name}
      </p>
      <div className="w-full flex items-center justify-between gap-10">
        <div className="w-1/2 p-10 border-2 border-gray-200 flex flex-col gap-2">
          {unassignedIndicators.map((indicator) => (
            <div
              key={indicator.goal_indicator_id}
              className="w-full flex flex-col gap-1 bg-green-200"
            >
              <p className="text-lg font-semibold">
                {indicator.goal_indicator_id} {indicator.md_indicator.name}
              </p>
              <p className="text-sm text-gray-500">
                {indicator.md_indicator.description}
              </p>
            </div>
          ))}
        </div>
        <div className="w-1/2 p-10 border-2 border-gray-200">
          fill up indicator details
        </div>
      </div>
    </main>
  );
}
