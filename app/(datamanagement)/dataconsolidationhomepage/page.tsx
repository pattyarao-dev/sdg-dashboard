import { BiSolidComponent } from "react-icons/bi";
import { RiDatabaseLine } from "react-icons/ri";
import { FaRegListAlt } from "react-icons/fa";
import Link from "next/link";

export default async function DataConsolidationHomepage() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
      <div className="w-2/5 flex flex-col items-center justify-center gap-10">
        <h1 className="w-full text-center uppercase font-bold text-4xl">
          Manage your data:
        </h1>
        <div className="w-full flex items-center justify-evenly">
          <Link
            href="/goalfactormanagement"
            className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
          >
            <BiSolidComponent className="text-7xl" />
            <button>Add Goal Factors</button>
          </Link>
          <Link
            href="/progressform"
            className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
          >
            <FaRegListAlt className="text-7xl" />
            <button>Update Progress Form</button>
          </Link>
          <Link
            href="/baselineform"
            className="w-[220px] h-[250px] p-4 flex flex-col justify-center items-center bg-white/70 rounded-lg drop-shadow-md gap-3"
          >
            <RiDatabaseLine className="text-7xl" />
            <button>Update Indicator Baselines</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
