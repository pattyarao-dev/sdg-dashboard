"use client";
import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface NavbarProps {
  session: Session | null;
}

const Navbar = ({ session }: NavbarProps) => {
  const [userRoleId, setUserRoleId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [loading, setLoading] = useState(true);

  // Fetch user role from API
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/getUser");

        if (response.ok) {
          const data = await response.json();
          setUserRoleId(data.userRoleId);
          setUserEmail(data.email);
        } else {
          console.error("Failed to fetch user role");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [session]);

  const canAccessIndicators = () => userRoleId === 1 || userRoleId === 2;
  const canAccessProjects = () => userRoleId === 1 || userRoleId === 2;
  const canAccessData = () => [1, 2, 3, 4].includes(userRoleId!);
  const canAccessDashboard = () => [1, 2, 3, 4].includes(userRoleId!);

  // Show loading state while fetching user role
  if (loading && session) {
    return (
      <div className="z-40 w-full h-fit sticky top-0 flex items-center justify-between bg-gradient-to-br from-green-200/80 to-orange-100/80 backdrop-blur px-10 py-6 drop-shadow-lg text-gray-700 font-semibold uppercase">
        <div className="w-1/4">
          <Link href="/">SDG Dashboard</Link>
        </div>
        <div className="w-full flex items-center justify-end gap-8">
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="z-40 w-full h-fit sticky top-0 flex items-center justify-between bg-gradient-to-br from-green-200/80 to-orange-100/80 backdrop-blur px-10 py-6 drop-shadow-lg text-gray-700 font-semibold">
      <div className="w-1/4">
        <Link href="/">SDG Dashboard</Link>
      </div>
      {session ? (
        <div className="w-full flex items-center justify-end gap-8">
          {/* Dashboard - Available to all logged-in users */}
          <div className="flex items-center gap-6 uppercase font-bold">
            {canAccessDashboard() && (
              <Link
                href="/dashboard"
                className="hover:text-green-800 transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Indicator Management - Admin (1) and SDG Planning Officer (2) */}
            {canAccessIndicators() && (
              <Link
                href="/indicatormanagement"
                className="hover:text-green-800 transition-colors"
              >
                Indicator Management
              </Link>
            )}

            {/* Project Management - Admin (1) and SDG Planning Officer (2) */}
            {canAccessProjects() && (
              <Link
                href="/projectmanagement"
                className="hover:text-green-800 transition-colors"
              >
                Project Management
              </Link>
            )}

            {/* Data Management - All user types */}
            {canAccessData() && (
              <Link
                href="/datamanagementhome"
                className="hover:text-green-800 transition-colors"
              >
                Data Management
              </Link>
            )}
          </div>

          <div className="w-fit p-4 flex items-center gap-4 bg-white rounded-lg drop-shadow-sm">
            <p>{userEmail}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/dashboard" })}
              className="w-fit px-4 py-1 bg-green-800 text-white rounded-lg text-sm hover:bg-green-500 transition-all duration-100"
            >
              Sign Out
            </button>
          </div>
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
