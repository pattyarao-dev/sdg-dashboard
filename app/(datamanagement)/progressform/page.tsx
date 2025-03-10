import ProgressFormComponent from "@/components/ProgressFormComponent";
import { getGoalsInformation } from "@/app/actions/actions";

export default async function ProgressForm() {
  const processedGoals = await getGoalsInformation();

  return (
    <main className="w-full min-h-screen p-10 flex flex-col items-center ">
      <ProgressFormComponent goals={processedGoals} />
    </main>
  );
}
