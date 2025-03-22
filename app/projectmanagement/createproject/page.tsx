import { getGoalIndicators } from "@/app/actions/actions_projectmanagement";
import CreateNewProject from "@/components/projectmanagement/CreateNewProject";

export default async function CreateProject() {
  // const goalIndicators = await getGoalIndicators();

  return <CreateNewProject />;
}
