"use client";

import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";

interface NavbarProps {
  session: Session | null;
}

const Navbar = ({ session }: NavbarProps) => {
  const router = useRouter();

  return (
    <div className="z-40 w-full h-fit sticky top-0 flex items-center justify-between bg-gradient-to-br from-green-200/80 to-orange-100/80 backdrop-blur px-10 py-6 drop-shadow-lg text-gray-700 font-semibold uppercase">
      <div className="w-1/4">
        <Link href="/">SDG Dashboard</Link>
      </div>

      {session ? (
        <div className="w-full flex items-center justify-end gap-8">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/indicatormanagement">Indicator Management</Link>
          <Link href="/projectmanagement">Project Management</Link>
          <Link href="/datamanagementhome">Data Management</Link>
          <button
            onClick={() => signOut()}
            className="w-fit px-6 py-2 bg-white rounded-lg drop-shadow-sm"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <Link href="/login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
