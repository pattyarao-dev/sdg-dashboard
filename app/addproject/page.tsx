import AddProjectForm from "@/components/AddProjectForm";
import { getIndicators } from "../actions/actions"; // Function to fetch indicators

export default async function AddProject() {
  const indicatorsList = await getIndicators();

  return (
    <div className="W-full min-h-screen flex items-center justify-center p-28">
      <AddProjectForm indicatorsList={indicatorsList} />
    </div>
  );
}
