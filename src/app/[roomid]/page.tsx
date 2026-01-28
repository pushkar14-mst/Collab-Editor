import CodeEditor from "@/src/components/code-editor";
import Toolbar from "@/src/components/toolbar";
import { notFound } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: { roomid: string };
}) {
  const { roomid } = await params;
  if (!roomid) return notFound();

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-gray-950 flex-col">
      <Toolbar />
      <main className="flex-1 w-full min-h-0">
        <CodeEditor roomId={roomid} />
      </main>
    </div>
  );
}
