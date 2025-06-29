import MainDashboard from "@/components/dashboard/MainDashboard"
import { getGoalsInformation } from "../actions/actions"

const Dashboard = async () => {
  const goals = await getGoalsInformation()
  return (
    <>
      <main className="w-full h-screen flex flex-wrap justify-center items-center">
        <MainDashboard goals={goals} />
      </main>
    </>
  )
}

export default Dashboard
