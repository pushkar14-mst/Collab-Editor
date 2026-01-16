"use client";

import Toolbar from "../components/toolbar";
import CodeEditor from "../components/code-editor";

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-gray-950 flex-col">
      <Toolbar />
      <main className="flex-1 w-full">
        <CodeEditor />
      </main>
    </div>
  );
}
