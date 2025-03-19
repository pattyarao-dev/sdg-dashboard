"use server";

import prisma from "@/utils/prisma";

export async function createIndicator(data: FormData){
  const goalId = parseInt(formData.get("goalId") as string, 10);
  const indicatorsData = JSON.parse(formData.get("indicators") as string);

  console.log("Received indicators:", indicatorsData);

  if (!Array.isArray(indicatorsData) || indicatorsData.length === 0) {
    return {
      success: false,
      message: "❌ No indicators were added.",
      addedIndicators: [],
      duplicateIndicators: [],
    };
  }

  const indicator = await prisma.md_indicator.create({
    data: {
      name: data.
    }
  })
}
