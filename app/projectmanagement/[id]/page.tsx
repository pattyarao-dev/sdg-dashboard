// import {
//   getProject,
//   getUnassignedProjectGoalIndicators,
// } from "@/app/actions/actions";
// import AddProject from "@/components/AddProject";
import { getAllGoalIndicators } from "@/app/actions/actions_projectmanagement";
import AddProjectIndicators from "@/components/projectmanagement/AddProjectIndicators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function AddProjectIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.userTypeId;
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
    <>
      {userRole === 1 || userRole === 2 ? (
        <main>
          <AddProjectIndicators gols={goals} id={id} />
        </main>
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <h1>You are not authorized to view this page.</h1>
        </div>
      )}
    </>
  );
}
