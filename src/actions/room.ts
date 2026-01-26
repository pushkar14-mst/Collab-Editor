"use server";

import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export async function createNewRoom() {
  const room = await prisma.room.create({
    data: {
      name: "Untitled",
      code: "// Start coding...\n",
      language: "javascript",
    },
  });

  redirect(`/${room.id}`);
}
