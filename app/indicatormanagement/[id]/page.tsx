import { getIndicators } from "@/app/actions/actions";
import AddIndicator from "@/components/AddIndicator";
import GoBackButton from "@/components/GoBackButton";
import prisma from "@/utils/prisma";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const indicators = await prisma.md_indicator.findMany();

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      <AddIndicator goalId={id} indicators={indicators} />
    </div>
  );
}
