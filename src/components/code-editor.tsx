"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";

import { useCollaboration } from "../hooks/useCollaboration";
import { setCode } from "../store/editor-slice";
import { RootState } from "../store";
import { addCursor, remoteCursors } from "../lib/code-mirror-cursor";

export default function CodeEditor({ roomId }: { roomId?: string }) {
  const dispatch = useDispatch();
  const { sendCodeChange, sendCursorUpdate } = useCollaboration(roomId);
  const { code, language, cursors } = useSelector(
    (state: RootState) => state.editor
  );
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const lastCursorPosRef = useRef<number>(0);
  // Map language to CodeMirror extensions
  const getLanguageExtension = useCallback(() => {
    switch (language) {
      case "javascript":
        return javascript({ jsx: true });
      case "typescript":
        return javascript({ jsx: true, typescript: true });
      case "python":
        return python();
      case "java":
        return java();
      case "cpp":
      case "c":
        return cpp();
      case "html":
        return html();
      case "css":
        return css();
      case "json":
        return json();
      case "markdown":
      case "md":
        return markdown();
      case "rust":
        return rust();
      case "go":
        return go();
      case "php":
        return php();
      default:
        return javascript();
    }
  }, [language]);

  const handleChange = useCallback(
    (value: string) => {
      dispatch(setCode(value));
      sendCodeChange(value);
    },
    [dispatch, sendCodeChange]
  );
  const handleCursorActivity = useCallback(() => {
    const view = editorRef.current?.view;
    if (!view) return;

    const pos = view.state.selection.main.head;

    // Only send if position changed
    if (pos !== lastCursorPosRef.current) {
      lastCursorPosRef.current = pos;

      // Convert position to line/column
      const line = view.state.doc.lineAt(pos);
      const lineNumber = line.number;
      const column = pos - line.from + 1;

      sendCursorUpdate(lineNumber, column);
    }
  }, [sendCursorUpdate]);

  // Update remote cursors when they change
  useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) return;

    // Convert line/column to position and update decorations
    Object.entries(cursors).forEach(([userId, cursor]) => {
      try {
        const line = view.state.doc.line(cursor.position.line);
        const pos = line.from + cursor.position.column - 1;

        view.dispatch({
          effects: addCursor.of({
            userId,
            userName: cursor.userName,
            pos: Math.max(0, Math.min(pos, view.state.doc.length)),
            color: cursor.color,
          }),
        });
      } catch (error) {
        console.error("Error positioning cursor:", error);
      }
    });

    // Remove cursors that are no longer in state
    const currentUserIds = Object.keys(cursors);
    // This is handled by the remoteCursorsField automatically
  }, [cursors]);
  return (
    <div className="h-full w-full overflow-hidden">
      <CodeMirror
        value={code}
        height="100vh" // Use viewport height
        style={{ height: "100%" }}
        theme={vscodeDark}
        extensions={[
          getLanguageExtension(),
          EditorView.lineWrapping, // Enable line wrapping,
          remoteCursors(),
          EditorView.updateListener.of((update) => {
            if (update.selectionSet) {
              handleCursorActivity();
            }
          }),
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}
