"use client";

interface ErrorPanelProps {
  errors: string[];
}

export default function ErrorPanel({ errors }: ErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div className="h-50 bg-gray-900 border-t border-red-500/50 flex flex-col">
      {/* Title bar */}
      <div className="h-10 px-4 flex items-center bg-red-900/20 border-b border-red-500/30">
        <span className="text-red-400 font-semibold text-sm flex items-center gap-2">
          <span className="text-lg">❌</span>
          Problems ({errors.length})
        </span>
      </div>

      {/* Error list */}
      <div className="flex-1 overflow-y-auto">
        {errors.map((error, index) => (
          <div
            key={index}
            className="px-4 py-2 hover:bg-red-900/10 border-b border-gray-800 flex items-start gap-3"
          >
            <span className="text-red-500 mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
