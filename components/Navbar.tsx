"use client";

import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  session: Session | null;
}

const Navbar = ({ session }: NavbarProps) => {
  const router = useRouter();
  if (!session) {
    return null;
  }

  return (
    <div className="z-40 w-full h-fit sticky top-0 flex items-center justify-between bg-gradient-to-br from-green-200/80 to-orange-100/80 backdrop-blur px-10 py-6 drop-shadow-lg text-gray-700 font-semibold uppercase">
      <div className="">
        <h1>SDG Dashboard</h1>
      </div>
      <div className="w-fit flex items-center justify-end gap-8">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/indicatormanagement">Indicator Management</Link>
        <Link href="/projectmanagement">Project Management</Link>
        <Link href="/datamanagementhome">Data Management</Link>
      </div>
      {session ? (
        <button
          onClick={() => {
            signOut({ redirect: false });
            router.push("/");
            router.refresh();
          }}
        >
          Logout
        </button>
      ) : null}
    </div>
  );
};

export default Navbar;
