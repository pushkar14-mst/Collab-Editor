"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../lib/supabase";
import { nanoid } from "nanoid";
import { RootState } from "../store";
import {
  setCode,
  setUserId,
  setRoomId,
  updateCursor,
  removeCursor,
  setConnected,
  setLanguage,
} from "../store/editor-slice";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useCollaboration(roomIdFromUrl?: string) {
  const dispatch = useDispatch();
  const { code, userId, roomId, userName, language } = useSelector(
    (state: RootState) => state.editor
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isLocalChange = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadRoom = useCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const room = await response.json();
          dispatch(setCode(room.code));
          dispatch(setLanguage(room.language));
        }
      } catch (error) {
        console.error("Failed to load room:", error);
      }
    },
    [dispatch]
  );

  // Save code to database (debounced)
  const saveCode = useCallback(
    async (roomId: string, code: string, language: string) => {
      try {
        await fetch(`/api/${roomId}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language }),
        });
      } catch (error) {
        console.error("Failed to save code:", error);
      }
    },
    []
  );

  // Save snapshot periodically
  const saveSnapshot = useCallback(
    async (roomId: string, code: string, userId: string, userName: string) => {
      try {
        await fetch(`/api/snapshots/${roomId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, userId, userName }),
        });
      } catch (error) {
        console.error("Failed to save snapshot:", error);
      }
    },
    []
  );
  useEffect(() => {
    // Generate userId if doesn't exist
    if (!userId) {
      const newUserId = nanoid(8);
      dispatch(setUserId(newUserId));
      return; // Wait for next render with userId
    }

    // Set or generate roomId
    const currentRoomId = roomIdFromUrl || roomId;
    if (!currentRoomId) return;

    if (currentRoomId !== roomId) {
      dispatch(setRoomId(currentRoomId));
      loadRoom(currentRoomId);
      return;
    }

    // Create Supabase channel for this room
    const channel = supabase.channel(`room:${currentRoomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own messages
      },
    });

    // Listen for code changes from other users
    channel
      .on("broadcast", { event: "code-change" }, (payload) => {
        if (payload.payload.userId !== userId) {
          isLocalChange.current = true;
          dispatch(setCode(payload.payload.code));
        }
      })
      .on("broadcast", { event: "cursor-move" }, (payload) => {
        if (payload.payload.userId !== userId) {
          dispatch(
            updateCursor({
              userId: payload.payload.userId,
              userName: payload.payload.userName,
              position: payload.payload.position,
              color: payload.payload.color,
            })
          );
        }
      })
      .on("broadcast", { event: "user-left" }, (payload) => {
        dispatch(removeCursor(payload.payload.userId));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          dispatch(setConnected(true));
          console.log("Connected to room:", currentRoomId);

          // Announce presence
          channel.send({
            type: "broadcast",
            event: "user-joined",
            payload: { userId, userName },
          });
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "user-left",
          payload: { userId },
        });
        channelRef.current.unsubscribe();
      }
      dispatch(setConnected(false));
    };
  }, [userId, roomId, roomIdFromUrl, dispatch, loadRoom]);
  // Auto-save code to database (debounced)
  useEffect(() => {
    if (!roomId || !code) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveCode(roomId, code, language);
    }, 2000); // Save after 2 seconds of no changes

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [code, language, roomId, saveCode]);
  // Send code changes to other users
  const sendCodeChange = (newCode: string) => {
    if (channelRef.current && !isLocalChange.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "code-change",
        payload: {
          code: newCode,
          userId,
          userName,
        },
      });
    }
    isLocalChange.current = false;
  };

  // Send cursor position to other users
  const sendCursorUpdate = (line: number, column: number) => {
    if (channelRef.current) {
      // Generate consistent color for this user
      const color = `hsl(${(userId.charCodeAt(0) * 137.5) % 360}, 70%, 60%)`;

      channelRef.current.send({
        type: "broadcast",
        event: "cursor-move",
        payload: {
          userId,
          userName,
          position: { line, column },
          color,
        },
      });
    }
  };
  const createSnapshot = useCallback(() => {
    if (roomId && code && userId) {
      saveSnapshot(roomId, code, userId, userName);
    }
  }, [roomId, code, userId, userName, saveSnapshot]);
  return {
    sendCodeChange,
    sendCursorUpdate,
    createSnapshot,
  };
}
