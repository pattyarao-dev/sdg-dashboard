/*
  Warnings:

  - You are about to drop the column `global_current_value` on the `td_goal_indicator` table. All the data in the column will be lost.
  - You are about to drop the column `global_current_value` on the `td_goal_sub_indicator` table. All the data in the column will be lost.
  - You are about to drop the column `project_current_value` on the `td_project_indicator` table. All the data in the column will be lost.
  - You are about to drop the column `project_current_value` on the `td_project_sub_indicator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "md_user" ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "td_goal_indicator" DROP COLUMN "global_current_value";

-- AlterTable
ALTER TABLE "td_goal_sub_indicator" DROP COLUMN "global_current_value";

-- AlterTable
ALTER TABLE "td_project_indicator" DROP COLUMN "project_current_value";

-- AlterTable
ALTER TABLE "td_project_sub_indicator" DROP COLUMN "project_current_value";

-- CreateTable
CREATE TABLE "td_indicator_value" (
    "value_id" SERIAL NOT NULL,
    "goal_indicator_id" INTEGER,
    "project_indicator_id" INTEGER,
    "indicator_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "measurement_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "td_indicator_value_pkey" PRIMARY KEY ("value_id")
);

-- CreateTable
CREATE TABLE "td_sub_indicator_value" (
    "value_id" SERIAL NOT NULL,
    "goal_sub_indicator_id" INTEGER,
    "project_sub_indicator_id" INTEGER,
    "sub_indicator_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "measurement_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "td_sub_indicator_value_pkey" PRIMARY KEY ("value_id")
);

-- AddForeignKey
ALTER TABLE "td_indicator_value" ADD CONSTRAINT "td_indicator_value_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "md_user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_indicator_value" ADD CONSTRAINT "td_indicator_value_goal_indicator_id_fkey" FOREIGN KEY ("goal_indicator_id") REFERENCES "td_goal_indicator"("goal_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_indicator_value" ADD CONSTRAINT "td_indicator_value_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "md_indicator"("indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_indicator_value" ADD CONSTRAINT "td_indicator_value_project_indicator_id_fkey" FOREIGN KEY ("project_indicator_id") REFERENCES "td_project_indicator"("project_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_sub_indicator_value" ADD CONSTRAINT "td_sub_indicator_value_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "md_user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_sub_indicator_value" ADD CONSTRAINT "td_sub_indicator_value_goal_sub_indicator_id_fkey" FOREIGN KEY ("goal_sub_indicator_id") REFERENCES "td_goal_sub_indicator"("goal_sub_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_sub_indicator_value" ADD CONSTRAINT "td_sub_indicator_value_project_sub_indicator_id_fkey" FOREIGN KEY ("project_sub_indicator_id") REFERENCES "td_project_sub_indicator"("project_sub_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "td_sub_indicator_value" ADD CONSTRAINT "td_sub_indicator_value_sub_indicator_id_fkey" FOREIGN KEY ("sub_indicator_id") REFERENCES "md_sub_indicator"("sub_indicator_id") ON DELETE CASCADE ON UPDATE NO ACTION;
