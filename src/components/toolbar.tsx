"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useState } from "react";
import { setLanguage, setUserName } from "../store/editor-slice";
import { useCollaboration } from "../hooks/useCollaboration";

/**
 * Toolbar Component
 * Language selector, room info, and user controls
 */

export default function Toolbar() {
  const dispatch = useDispatch();
  const { language, roomId, userName, isConnected } = useSelector(
    (state: RootState) => state.editor
  );
  const { createSnapshot } = useCollaboration();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
  ];

  function handleNameSubmit() {
    if (tempName.trim()) {
      dispatch(setUserName(tempName.trim()));
      setIsEditingName(false);
    }
  }

  function copyRoomLink() {
    if (roomId) {
      const link = `${window.location.origin}/${roomId}`;
      navigator.clipboard.writeText(link);
      alert("Room link copied!");
    }
  }

  return (
    <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-white font-semibold text-lg">
          💻 Collaborative Editor
        </h1>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-sm text-gray-400">
            {isConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      {/* Center - Language Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400">Language:</label>
        <select
          value={language}
          onChange={(e) => dispatch(setLanguage(e.target.value))}
          className="bg-gray-800 text-white px-3 py-1.5 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right side - User & Room */}
      <div className="flex items-center gap-4">
        {/* User Name */}
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 text-sm w-32"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTempName(userName);
              setIsEditingName(true);
            }}
            className="text-sm text-gray-300 hover:text-white"
          >
            👤 {userName}
          </button>
        )}

        {/* Room Info */}
        {roomId && (
          <button
            onClick={copyRoomLink}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
          >
            📋 Copy Room Link
          </button>
        )}
        <button
          onClick={createSnapshot}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-1"
          title="Save snapshot"
        >
          💾 Save
        </button>
      </div>
    </div>
  );
}
