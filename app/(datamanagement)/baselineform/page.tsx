import { getGoalsInformation } from "@/app/actions/actions";
import BaselineFormComponent from "@/components/BaselineFormComponent";

export default async function BaselinesForm() {
  const processedGoals = await getGoalsInformation();
  return (
    <main>
      <BaselineFormComponent goals={processedGoals} />
    </main>
  );
}
