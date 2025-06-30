import MainDashboard from "@/components/dashboard/MainDashboard"
import { getGoalsInformation } from "../../actions/actions"

export default async function GoalProgress() {
  const goals = await getGoalsInformation()
  return (
    <>
      <main className="w-full h-screen flex flex-wrap justify-center items-center gap-10">
        <MainDashboard goals={goals} />
      </main>
    </>
  )
}
