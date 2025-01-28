import AddIndicatorForm from "@/components/AddIndicatorForm";
import { getGoals } from "../actions/actions";

// import ProjectSelector from "@/components/ProjectSelector";

export default async function AddIndicator() {
  const goalsList = await getGoals();

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <AddIndicatorForm goalsList={goalsList} />
    </div>
  );
}
