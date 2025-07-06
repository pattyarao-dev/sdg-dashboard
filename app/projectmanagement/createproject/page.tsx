import { getLocations } from "@/app/actions/actions_projectmanagement";
import CreateNewProject from "@/components/projectmanagement/CreateNewProject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function CreateProject() {
  // const goalIndicators = await getGoalIndicators();
  const locations = await getLocations();
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.userTypeId;
  return (
    <>
      {userRole === 1 || userRole === 2 ? (
        <CreateNewProject locations={locations} />
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <h1>You are not authorized to view this page</h1>
        </div>
      )}
    </>
  );
}
