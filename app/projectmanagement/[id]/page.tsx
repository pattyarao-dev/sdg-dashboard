import {
  getProject,
  getUnassignedIndicators,
  getUnassignedProjectGoalIndicators,
} from "@/app/actions/actions";
import AddProject from "@/components/AddProject";

export default async function AddProjectIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;

  const project = await getProject(Number(id));

  const unassignedIndicators = await getUnassignedProjectGoalIndicators(
    Number(id),
  );

  // const handleSearchIndicator = () => {
  //   const filteredIndicators = unassignedIndicators.filter((indicator) =>
  //     indicator.md_indicator.name
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()),
  //   );
  //   return filteredIndicators; // Update the UI with the filtered indicators
  // };

  return (
    <main>
      {project && unassignedIndicators && (
        <AddProject
          project={project}
          unassignedIndicators={unassignedIndicators}
        />
      )}
    </main>
  );
}
