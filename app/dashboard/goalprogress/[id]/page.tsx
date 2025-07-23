import { getGoalIndicators } from "@/app/actions/actions_indicatormanagement";
import IndicatorDashboard from "@/components/dashboard/IndicatorDashboard";
import { authOptions } from "@/libs/auth";
import { DashboardAvailableIndicatorWithHierarchy } from "@/types/dashboard.types";
import { getServerSession } from "next-auth";

export default async function DashboardGoal({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const session = await getServerSession(authOptions)

  const availableIndicators: DashboardAvailableIndicatorWithHierarchy[] = await getGoalIndicators(id);
  console.log(availableIndicators)
  return (
    <main className="w-full h-screen flex flex-wrap justify-center items-center gap-10">
      <IndicatorDashboard goaldId={id.toString()} indicators={availableIndicators} session={session}/>
    </main>
  )
}
