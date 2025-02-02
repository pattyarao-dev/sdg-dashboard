import { getIndicators } from "@/app/actions/actions";
import AddIndicator from "@/components/AddIndicator";
import GoBackButton from "@/components/GoBackButton";
import { IIndicator } from "@/types/indicator.types";
import prisma from "@/utils/prisma";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const indicators = await prisma.md_indicator.findMany();
  const goalIndicators = await prisma.td_goal_indicator.findMany({
    where: {
      goal_id: Number(id),
    },
    select: {
      indicator_id: true,
    },
  });

  const finalGoalIndicators = goalIndicators.map(
    (indicator) => indicator.indicator_id,
  );

  const availableIndicators = indicators.filter((indicator) => {
    if (!finalGoalIndicators.includes(indicator.indicator_id)) {
      return indicator;
    }
  });

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      <AddIndicator goalId={id} indicators={availableIndicators} />
    </div>
  );
}
