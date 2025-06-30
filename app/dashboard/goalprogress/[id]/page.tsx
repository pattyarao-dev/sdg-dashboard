import { getGoalIndicators } from "@/app/actions/actions_indicatormanagement";
import IndicatorDashboard from "@/components/dashboard/IndicatorDashboard";
import { DashboardAvailableIndicator } from "@/types/dashboard.types";

export default async function DashboardGoal({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);

  const availableIndicators: DashboardAvailableIndicator[] = await getGoalIndicators(id);
  console.log(availableIndicators)
  return (
    <main className="w-full h-screen flex flex-wrap justify-center items-center gap-10">
      <IndicatorDashboard goaldId={id.toString()} indicators={availableIndicators} />
    </main>
  )
}
