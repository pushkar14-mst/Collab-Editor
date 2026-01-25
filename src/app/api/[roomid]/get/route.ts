import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get("roomid");

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
}
