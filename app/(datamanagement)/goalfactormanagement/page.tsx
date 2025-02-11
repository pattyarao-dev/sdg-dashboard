import { getGoalsInformation } from "@/app/actions/actions";
import AddFactorComponent from "@/components/AddFactorComponent";

export default async function GoalFactorManagement() {
  const processedGoals = await getGoalsInformation();

  return (
    <main className="w-full min-h-screen p-10 flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
      <div className="w-full flex flex-col gap-10">
        <h1 className="text-2xl font-bold">Add Factors to Goals</h1>
        <AddFactorComponent goals={processedGoals} />
      </div>
    </main>
  );
}
