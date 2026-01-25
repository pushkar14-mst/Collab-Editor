"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export default function Home() {
  const roomId = nanoid(10);
  const router = useRouter();
  return router.push(`/${roomId}`);
}
