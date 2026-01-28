import { prisma } from "@/src/lib/prisma";
import { withParams } from "@/src/lib/route-handler";
import { NextResponse } from "next/server";

export const GET = withParams(async (request, segment) => {
  const roomId = segment.params?.roomid;

  if (!roomId) {
    return NextResponse.json({ error: "Room ID required" }, { status: 400 });
  }
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        snapshots: {
          orderBy: { timestamp: "desc" },
          take: 1, // Get latest snapshot
        },
      },
    });

    if (!room) {
      console.log("here");
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
});
