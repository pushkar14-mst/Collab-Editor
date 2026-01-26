import { createNewRoom } from "@/src/actions/room";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          💻 Collaborative Code Editor
        </h1>
        <form action={createNewRoom}>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors"
          >
            Create New Session
          </button>
        </form>
      </div>
    </div>
  );
}
