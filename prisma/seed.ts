import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.md_user.upsert({
    where: { email: "test@gmail.com" },
    update: {},
    create: {
      first_name: "Alice",
      last_name: "Garcia",
      email: "alice@gmail.com",
      password: "1234",
    },
  });
  console.log({ user });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
