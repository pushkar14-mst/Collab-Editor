"use client";

import { useRef, useEffect, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";

import * as monaco from "monaco-editor";
import { setCode } from "../store/editor-slice";
import { RootState } from "../store";
import { useCollaboration } from "../hooks/useCollaboration";
import { useWasmParser } from "../hooks/useWasmParser";
import ErrorPanel from "./error-panel";

export default function CodeEditor({ roomId }: { roomId?: string }) {
  const dispatch = useDispatch();
  const { sendCodeChange, sendCursorUpdate } = useCollaboration(
    roomId ? roomId : undefined
  );
  const { code, language } = useSelector((state: RootState) => state.editor);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { parseCode, loading: wasmLoading } = useWasmParser();
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (code && parseCode) {
      const result = parseCode(code);
      console.log("Parse result:", result); // Add this
      console.log("Errors:", result?.errors); // Add this
      if (result && result.errors) {
        setErrors(result.errors);
      } else {
        setErrors([]);
      }
    }
  }, [code, parseCode]);

  function handleEditorMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
    editor.onDidChangeCursorPosition((e) => {
      sendCursorUpdate(e.position.lineNumber, e.position.column);
    });
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      dispatch(setCode(value));
      sendCodeChange(value);
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
          }}
        />
      </div>

      <ErrorPanel errors={errors} />
    </div>
  );
}
