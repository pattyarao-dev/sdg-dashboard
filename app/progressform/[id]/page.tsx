import GoBackButton from "@/components/GoBackButton";
import ProgressForm from "@/components/ProgressForm";
import prisma from "@/utils/prisma";

export default async function UpdateProgress({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);

  const indicators = await prisma.md_indicator.findMany({
    select: {
      indicator_id: true,
      name: true,
      description: true,
      md_sub_indicator: {
        select: {
          sub_indicator_id: true,
          name: true,
        },
      },
    },
  });
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

  const goalIndicatorsInfo = indicators.filter((indicator) => {
    if (!finalGoalIndicators.includes(indicator.indicator_id)) {
      return indicator;
    }
  });

  const goal = await prisma.md_goal.findUnique({
    where: { goal_id: id },
    select: { name: true },
  });

  return (
    <main>
      <GoBackButton />
      <ProgressForm
        goalId={id}
        goalName={goal?.name}
        goalIndicators={goalIndicatorsInfo}
      />
    </main>
  );
}
