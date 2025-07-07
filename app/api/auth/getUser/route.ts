import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  const userEmail = (session?.user as any)?.email;
  const userRole = (session?.user as any)?.userTypeId;

  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ email: userEmail, userRoleId: userRole });
};
