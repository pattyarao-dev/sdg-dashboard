import MainDashboard from "@/components/dashboard/MainDashboard";
import { getGoalsInformation } from "../../actions/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function GoalProgress() {
  const session = await getServerSession(authOptions)
  const goals = await getGoalsInformation();
  return (
    <main className="w-full min-h-screen p-16 flex flex-wrap justify-center items-center gap-10">
      <MainDashboard goals={goals} session={session}/>
    </main>
  );
}
