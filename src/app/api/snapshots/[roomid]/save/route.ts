import { prisma } from "@/src/lib/prisma";
import { withParams } from "@/src/lib/route-handler";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
  userId: z.string(),
  userName: z.string(),
});

export const POST = withParams(async (request, segment) => {
  try {
    const roomId = segment.params?.roomid;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }
    const body = await request.json();
    if (!body) return NextResponse.error();
    const { code, userId, userName } = z.parse(schema, body);

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const snapshot = await prisma.codeSnapshot.create({
      data: {
        roomId,
        code,
        userId,
        userName: userName || "Anonymous",
      },
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Error creating snapshot:", error);
    return NextResponse.json(
      { error: "Failed to create snapshot" },
      { status: 500 }
    );
  }
});
