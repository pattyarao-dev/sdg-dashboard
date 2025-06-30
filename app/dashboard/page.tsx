import Link from "next/link"
import { TbStarsFilled } from "react-icons/tb"
import { IoTrophy } from "react-icons/io5"

const Dashboard = async () => {
  return (
    <>

      <main className="w-full min-h-screen flex flex-col items-center justify-center gap-10">
        <div className="w-full flex justify-center">
          <p className="text-4xl font-bold uppercase">
            Indicators Data Progress Dashboard
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-16">
          <Link href="/dashboard/projectprogress">
            <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
              <TbStarsFilled className="text-7xl" />
              <p className="text-xl uppercase font-black">
                Project Indicators Progress
              </p>
            </div>
          </Link>
          <Link href="/dashboard/goalprogress">
            <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
              <IoTrophy className="text-7xl" />
              <p className="text-xl uppercase font-black">Goal Indicators Progress</p>
            </div>
          </Link>
        </div>
      </main>

    </>
  )
}

export default Dashboard
