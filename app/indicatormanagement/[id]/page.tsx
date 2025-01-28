import { getIndicators } from "@/app/actions/actions";
import AddIndicator from "@/components/AddIndicator";
import GoBackButton from "@/components/GoBackButton";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const indicators = await getIndicators();

  return (
    <div>
      <GoBackButton />
      <AddIndicator goalId={id} indicators={indicators} />
    </div>
  );
}
