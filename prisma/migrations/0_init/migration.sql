-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('ongoing', 'complete');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('active', 'disabled');

-- CreateTable
CREATE TABLE "md_goal" (
    "goal_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "md_goal_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "md_indicator" (
    "indicator_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "status" NOT NULL,

    CONSTRAINT "md_indicator_pkey" PRIMARY KEY ("indicator_id")
);

-- CreateTable
CREATE TABLE "md_sub_indicator" (
    "sub_indicator_id" SERIAL NOT NULL,
    "parent_indicator_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "status" NOT NULL,

    CONSTRAINT "md_sub_indicator_pkey" PRIMARY KEY ("sub_indicator_id")
);

-- CreateTable
CREATE TABLE "md_user" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(45),
    "last_name" VARCHAR(45),
    "email" VARCHAR(45) NOT NULL,
    "password" VARCHAR(45) NOT NULL,

    CONSTRAINT "md_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "md_user_role" (
    "user_id" INTEGER NOT NULL,
    "user_type_id" INTEGER NOT NULL,

    CONSTRAINT "md_user_role_pkey" PRIMARY KEY ("user_id","user_type_id")
);

-- CreateTable
CREATE TABLE "ref_user_type" (
    "user_type_id" SERIAL NOT NULL,
    "name" VARCHAR(45) NOT NULL,

    CONSTRAINT "ref_user_type_pkey" PRIMARY KEY ("user_type_id")
);

-- CreateTable
CREATE TABLE "td_goal_indicator" (
    "goal_indicator_id" SERIAL NOT NULL,
    "goal_id" INTEGER NOT NULL,
    "indicator_id" INTEGER NOT NULL,
    "global_target_value" DOUBLE PRECISION,
    "global_baseline_value" DOUBLE PRECISION,
    "global_current_value" DOUBLE PRECISION,

    CONSTRAINT "td_goal_indicator_pkey" PRIMARY KEY ("goal_indicator_id")
);

-- CreateTable
CREATE TABLE "td_goal_sub_indicator" (
    "goal_sub_indicator_id" SERIAL NOT NULL,
    "goal_indicator_id" INTEGER NOT NULL,
    "sub_indicator_id" INTEGER NOT NULL,
    "global_target_value" DOUBLE PRECISION,
    "global_baseline_value" DOUBLE PRECISION,
    "global_current_value" DOUBLE PRECISION,

    CONSTRAINT "td_goal_sub_indicator_pkey" PRIMARY KEY ("goal_sub_indicator_id")
);

-- CreateTable
CREATE TABLE "td_project" (
    "project_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "project_status" "project_status" NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "td_project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "td_project_indicator" (
    "project_indicator_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "indicator_id" INTEGER NOT NULL,
    "goal_indicator_id" INTEGER,
    "project_target_value" DOUBLE PRECISION,
    "project_baseline_value" DOUBLE PRECISION,
    "project_current_value" DOUBLE PRECISION,

    CONSTRAINT "td_project_indicator_pkey" PRIMARY KEY ("project_indicator_id")
);

-- CreateTable
CREATE TABLE "td_project_sub_indicator" (
    "project_sub_indicator_id" SERIAL NOT NULL,
    "project_indicator_id" INTEGER NOT NULL,
    "sub_indicator_id" INTEGER NOT NULL,
    "project_target_value" DOUBLE PRECISION,
    "project_baseline_value" DOUBLE PRECISION,
    "project_current_value" DOUBLE PRECISION,

    CONSTRAINT "td_project_sub_indicator_pkey" PRIMARY KEY ("project_sub_indicator_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "md_goal_name_key" ON "md_goal"("name");

-- CreateIndex
CREATE UNIQUE INDEX "md_indicator_name_key" ON "md_indicator"("name");

-- CreateIndex
CREATE UNIQUE INDEX "md_sub_indicator_name_key" ON "md_sub_indicator"("name");

-- CreateIndex
CREATE UNIQUE INDEX "md_user_email_key" ON "md_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ref_user_type_name_key" ON "ref_user_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "td_goal_indicator_goal_id_indicator_id_key" ON "td_goal_indicator"("goal_id", "indicator_id");

-- CreateIndex
CREATE UNIQUE INDEX "td_goal_sub_indicator_goal_indicator_id_sub_indicator_id_key" ON "td_goal_sub_indicator"("goal_indicator_id", "sub_indicator_id");

-- CreateIndex
CREATE UNIQUE INDEX "td_project_indicator_project_id_indicator_id_key" ON "td_project_indicator"("project_id", "indicator_id");

-- CreateIndex
CREATE UNIQUE INDEX "td_project_sub_indicator_project_indicator_id_sub_indicator_key" ON "td_project_sub_indicator"("project_indicator_id", "sub_indicator_id");

-- AddForeignKey
ALTER TABLE "md_sub_indicator" ADD CONSTRAINT "md_sub_indicator_parent_indicator_id_fkey" FOREIGN KEY ("parent_indicator_id") REFERENCES "md_indicator"("indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "md_user_role" ADD CONSTRAINT "md_user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "md_user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "md_user_role" ADD CONSTRAINT "md_user_role_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "ref_user_type"("user_type_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_goal_indicator" ADD CONSTRAINT "td_goal_indicator_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "md_goal"("goal_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_goal_indicator" ADD CONSTRAINT "td_goal_indicator_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "md_indicator"("indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_goal_sub_indicator" ADD CONSTRAINT "td_goal_sub_indicator_goal_indicator_id_fkey" FOREIGN KEY ("goal_indicator_id") REFERENCES "td_goal_indicator"("goal_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_goal_sub_indicator" ADD CONSTRAINT "td_goal_sub_indicator_sub_indicator_id_fkey" FOREIGN KEY ("sub_indicator_id") REFERENCES "md_sub_indicator"("sub_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_project_indicator" ADD CONSTRAINT "td_project_indicator_goal_indicator_id_fkey" FOREIGN KEY ("goal_indicator_id") REFERENCES "td_goal_indicator"("goal_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_project_indicator" ADD CONSTRAINT "td_project_indicator_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "md_indicator"("indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_project_indicator" ADD CONSTRAINT "td_project_indicator_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "td_project"("project_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_project_sub_indicator" ADD CONSTRAINT "td_project_sub_indicator_project_indicator_id_fkey" FOREIGN KEY ("project_indicator_id") REFERENCES "td_project_indicator"("project_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_project_sub_indicator" ADD CONSTRAINT "td_project_sub_indicator_sub_indicator_id_fkey" FOREIGN KEY ("sub_indicator_id") REFERENCES "md_sub_indicator"("sub_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

