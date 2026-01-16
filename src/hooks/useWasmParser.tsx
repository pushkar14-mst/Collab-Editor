"use client";
import { useCallback, useEffect, useState } from "react";

export function useWasmParser() {
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWasm() {
      try {
        // Dynamic import needs to be async
        const wasm = await import("../../public/wasm/wasm_parser.js");

        // Initialize the Wasm module
        await wasm.default();

        // Set the module (it's the wasm object itself, not wasm.module)
        setWasmModule(wasm);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load Wasm:", error);
        setLoading(false);
      }
    }

    loadWasm();
  }, []);

  const parseCode = useCallback(
    (code: string) => {
      if (!wasmModule) return null;

      try {
        const result = wasmModule.parse_javascript(code);
        return result;
      } catch (error) {
        console.error("Parse error:", error);
        return null;
      }
    },
    [wasmModule]
  );

  return { parseCode, loading };
}
