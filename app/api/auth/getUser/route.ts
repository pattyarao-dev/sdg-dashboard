import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.userTypeId;

  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ userRoleId: userRole });
};
