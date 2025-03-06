import { getGoals } from "@/app/actions/actions";
import AddIndicator from "@/components/AddIndicator";
import GoBackButton from "@/components/GoBackButton";
import prisma from "@/utils/prisma";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const idNum = Number(id);

  const goal = await prisma.md_goal.findUnique({
    where: { goal_id: idNum },
    select: { name: true },
  });
  console.log(id);
  console.log(`this is ${goal?.name}`);

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
  // const goalIndicators = await prisma.td_goal_indicator.findMany({
  //   where: {
  //     goal_id: Number(id),
  //   },
  //   select: {
  //     indicator_id: true,
  //   },
  // });

  const goalIndicators = await prisma.td_goal_indicator.findMany({
    where: {
      goal_id: Number(id),
    },
    select: {
      goal_indicator_id: true,
      indicator_id: true,
      td_goal_indicator_required_data: {
        // select: {
        //   required_data_id: true,
        //   ref_required_data: {
        //     select: {
        //       name: true,
        //     },
        //   },
        // },
      },
    },
  });

  const requiredData = await prisma.ref_required_data.findMany({
    select: {
      required_data_id: true,
      name: true,
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

  // const goalIndicatorsWithRequiredData = goalIndicators.map((gi) => ({
  //   goal_indicator_id: gi.goal_indicator_id,
  //   indicator_id: gi.indicator_id,
  //   hasRequiredData: gi.td_goal_indicator_required_data.length > 0, // ✅ Check if required data exists
  //   assignedRequiredData: gi.td_goal_indicator_required_data.map((data) => ({
  //     required_data_id: data.required_data_id,
  //     name: data.ref_required_data.name,
  //   })),
  // }));

  // const filteredIndicatorsWithRequiredData =
  //   goalIndicatorsWithRequiredData.filter((indicator) => {
  //     if (indicator.hasRequiredData === true) {
  //       return indicator;
  //     }
  //   });

  // console.log(
  //   "Goal Indicators with Required Data:",
  //   goalIndicatorsWithRequiredData,
  // );
  console.log("Available Indicators:", availableIndicators);

  // console.log(JSON.stringify(availableIndicators, null, 2));

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      <AddIndicator
        goalName={goal?.name}
        goalId={id}
        indicators={availableIndicators}
        requiredData={requiredData}
      />
    </div>
  );
}
