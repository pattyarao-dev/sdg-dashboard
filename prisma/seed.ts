import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 🔹 Seed Users
  const adminUser = await prisma.md_user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      first_name: "Admin",
      last_name: "User",
      email: "admin@gmail.com",
      password: "password123", // ⚠️ Hash in production
    },
  });

  // 🔹 Seed User Roles
  const adminRole = await prisma.ref_user_type.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  await prisma.md_user_role.upsert({
    where: {
      user_id_user_type_id: {
        user_id: adminUser.user_id,
        user_type_id: adminRole.user_type_id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.user_id,
      user_type_id: adminRole.user_type_id,
    },
  });

  // 🔹 Seed Goals
  const goal1 = await prisma.md_goal.upsert({
    where: { name: "No Poverty" },
    update: {},
    create: {
      name: "No Poverty",
      description: "End poverty in all its forms everywhere.",
    },
  });

  const goal2 = await prisma.md_goal.upsert({
    where: { name: "Zero Hunger" },
    update: {},
    create: {
      name: "Zero Hunger",
      description: "End hunger and ensure access to safe, nutritious food.",
    },
  });

  // 🔹 Seed Indicators
  const indicator1 = await prisma.md_indicator.upsert({
    where: { name: "Poverty Rate" },
    update: {},
    create: {
      name: "Poverty Rate",
      description: "Percentage of population living below the poverty line.",
      status: "active",
    },
  });

  const indicator2 = await prisma.md_indicator.upsert({
    where: { name: "Food Insecurity" },
    update: {},
    create: {
      name: "Food Insecurity",
      description: "Percentage of people lacking regular access to food.",
      status: "active",
    },
  });

  // 🔹 Seed Sub-Indicators
  const subIndicator1 = await prisma.md_sub_indicator.upsert({
    where: { name: "Extreme Poverty" },
    update: {},
    create: {
      name: "Extreme Poverty",
      description: "Percentage of people living on less than $1.90 per day.",
      parent_indicator_id: indicator1.indicator_id,
      status: "active",
    },
  });

  // 🔹 Seed Goal-Indicator Mapping
  await prisma.td_goal_indicator.upsert({
    where: {
      goal_id_indicator_id: {
        goal_id: goal1.goal_id,
        indicator_id: indicator1.indicator_id,
      },
    },
    update: {},
    create: {
      goal_id: goal1.goal_id,
      indicator_id: indicator1.indicator_id,
      global_baseline_value: 10.5,
      global_target_value: 5.0,
    },
  });

  await prisma.td_goal_indicator.upsert({
    where: {
      goal_id_indicator_id: {
        goal_id: goal2.goal_id,
        indicator_id: indicator2.indicator_id,
      },
    },
    update: {},
    create: {
      goal_id: goal2.goal_id,
      indicator_id: indicator2.indicator_id,
      global_baseline_value: 20.0,
      global_target_value: 10.0,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
