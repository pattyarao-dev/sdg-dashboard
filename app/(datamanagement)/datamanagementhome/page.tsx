// import { BiSolidComponent } from "react-icons/bi";
// import { RiDatabaseLine } from "react-icons/ri";
// import { FaRegListAlt } from "react-icons/fa";
import Link from "next/link";
import { BiMath } from "react-icons/bi";
import { TbStarsFilled } from "react-icons/tb";
import { IoTrophy } from "react-icons/io5";
import { PiTargetBold } from "react-icons/pi";

export default async function DataConsolidationHomepage() {
  return (
    // <main className="w-full min-h-screen bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
    //   <div className="w-2/5 flex flex-col items-center justify-center gap-10">
    //     <h1 className="w-full text-center uppercase font-bold text-4xl">
    //       Manage your data:
    //     </h1>
    //     <div className="w-full flex items-center justify-evenly">
    //       <Link
    //         href="/goalfactormanagement"
    //         className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
    //       >
    //         <BiSolidComponent className="text-7xl" />
    //         <button>Add Goal Factors</button>
    //       </Link>
    //       <Link
    //         href="/progressform"
    //         className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
    //       >
    //         <FaRegListAlt className="text-7xl" />
    //         <button>Update Progress Form</button>
    //       </Link>
    //       <Link
    //         href="/baselineform"
    //         className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
    //       >
    //         <RiDatabaseLine className="text-7xl" />
    //         <button>Update Indicator Baselines</button>
    //       </Link>
    //     </div>
    //   </div>
    // </main>

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
        <Link href="">
          <div className="w-[300px] h-[350px] px-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-green-100/80 to-orange-100/80 rounded-lg">
            <PiTargetBold className="text-7xl" />
            <p className="text-xl uppercase font-black">
              Indicators Annual Targets
            </p>
          </div>
        </Link>
        <Link href="">
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
