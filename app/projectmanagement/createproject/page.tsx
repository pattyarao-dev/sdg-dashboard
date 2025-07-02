import { getLocations } from "@/app/actions/actions_projectmanagement";
import CreateNewProject from "@/components/projectmanagement/CreateNewProject";

export default async function CreateProject() {
  // const goalIndicators = await getGoalIndicators();
  const locations = await getLocations();
  return <CreateNewProject locations={locations} />;
}
