import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";

export const POST = async (request: Request) => {
  try {
    const { firstname, lastname, email, password, roleId } =
      await request.json();

    if (!firstname || !lastname || !email || !password || !roleId) {
      throw Error("Please complete all the forms!");
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const user = await prisma.md_user.create({
      data: {
        first_name: firstname,
        last_name: lastname,
        email: email,
        password: hash,
        md_user_role: {
          create: {
            user_type_id: roleId,
          },
        },
      },
      include: {
        md_user_role: {
          include: {
            ref_user_type: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
