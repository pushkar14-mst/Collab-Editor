import { prisma } from "@/src/lib/prisma";
import { withParams } from "@/src/lib/route-handler";
import { NextRequest, NextResponse } from "next/server";

export const GET = withParams(async (request, segment) => {
  const roomId = segment.params?.roomid;

  if (!roomId) {
    return NextResponse.json({ error: "Room ID required" }, { status: 400 });
  }

  try {
    const snapshots = await prisma.codeSnapshot.findMany({
      where: { roomId },
      orderBy: { timestamp: "desc" },
      take: 20, // Last 20 snapshots
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("Error fetching snapshots:", error);
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
});
