import { prisma } from "@/src/lib/prisma";
import { withParams } from "@/src/lib/route-handler";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
  language: z.string(),
});
export const PUT = withParams(async (request, segment) => {
  try {
    const roomId = segment.params?.roomid;
    const body = await request.json();
    if (!body) return NextResponse.error();
    const { code, language } = z.parse(schema, body);

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        code,
        language,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
});
