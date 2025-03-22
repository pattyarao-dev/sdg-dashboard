// import {
//   getProject,
//   getUnassignedProjectGoalIndicators,
// } from "@/app/actions/actions";
// import AddProject from "@/components/AddProject";
import { getAllGoalIndicators } from "@/app/actions/actions_projectmanagement";
import AddProjectIndicators from "@/components/projectmanagement/AddProjectIndicators";
import AddProjectIndicatorsRecursive from "@/components/projectmanagement/AddProjectIndicatorsRecursive";

export default async function AddProjectIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  // const unassignedIndicators = await getUnassignedProjectGoalIndicators(
  //   Number(id),
  // );

  // const handleSearchIndicator = () => {
  //   const filteredIndicators = unassignedIndicators.filter((indicator) =>
  //     indicator.md_indicator.name
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()),
  //   );
  //   return filteredIndicators; // Update the UI with the filtered indicators
  // };

  const goals = await getAllGoalIndicators();

  return (
    <main>
      {/* {project && unassignedIndicators && (
        <AddProject
          project={project}
          unassignedIndicators={unassignedIndicators}
        />
      )} */}
      <AddProjectIndicators gols={goals} id={id} />
    </main>
  );
}
