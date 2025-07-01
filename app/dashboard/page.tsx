import HomeDashboard from "@/components/dashboard/HomeDashboard"

const Dashboard = async () => {
  return (
    <>
      <main className="w-full min-h-screen flex flex-col items-center justify-center gap-10">
        <HomeDashboard />
      </main>
    </>
  )
}

export default Dashboard
