// import { BiSolidComponent } from "react-icons/bi";
// import { RiDatabaseLine } from "react-icons/ri";
// import { FaRegListAlt } from "react-icons/fa";
import Link from "next/link";
import { BiMath } from "react-icons/bi";
import { TbStarsFilled } from "react-icons/tb";
import { IoTrophy } from "react-icons/io5";

export default async function DataConsolidationHomepage() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center gap-10">
      <div className="w-full flex justify-center">
        <p className="text-4xl font-bold uppercase">
          Indicators Data Management
        </p>
      </div>

      <div className="w-full flex items-center justify-center gap-16">
        <Link href="/computationrules">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
            <BiMath className="text-7xl" />
            <p className="text-xl uppercase font-black">
              Indicator Computation Rules
            </p>
          </div>
        </Link>
        <Link href="/projectprogressform">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
            <TbStarsFilled className="text-7xl" />
            <p className="text-xl uppercase font-black">
              Project Indicators Data
            </p>
          </div>
        </Link>
        <Link href="/progressform">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
            <IoTrophy className="text-7xl" />
            <p className="text-xl uppercase font-black">Goal Indicators Data</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
