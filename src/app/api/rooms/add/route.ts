import { prisma } from "@/src/lib/prisma";
import { withParams } from "@/src/lib/route-handler";
import { NextResponse } from "next/server";
import { z } from "zod";
const schema = z.object({
  name: z.string(),
  code: z.string(),
  language: z.string(),
});
export const POST = withParams(async (request, segment) => {
  try {
    const body = await request.json();
    if (!body) return NextResponse.error();
    const { name, code, language } = z.parse(schema, body);

    const room = await prisma.room.create({
      data: {
        name: name || "Untitled",
        code: code || "// Start coding...\n",
        language: language || "javascript",
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
});
