import { getAvailableIndicators } from "@/app/actions/actions_indicatormanagement";
import { DashboardAvailableIndicator } from "@/types/dashboard.types";

export default async function DashboardGoal({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);

  const availableIndicators: DashboardAvailableIndicator[] = await getAvailableIndicators(id);
  console.log(availableIndicators)
  return (
    <div>
      hellow world
    </div>
  )
}
