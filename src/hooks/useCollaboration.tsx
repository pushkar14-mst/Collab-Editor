"use client";

import { useEffect, useRef } from "react";
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
} from "../store/editor-slice";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useCollaboration(roomIdFromUrl?: string) {
  const dispatch = useDispatch();
  const { code, userId, roomId, userName } = useSelector(
    (state: RootState) => state.editor
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isLocalChange = useRef(false);

  useEffect(() => {
    // Generate userId if doesn't exist
    if (!userId) {
      const newUserId = nanoid(8);
      dispatch(setUserId(newUserId));
      return; // Wait for next render with userId
    }

    // Set or generate roomId
    const currentRoomId = roomIdFromUrl || roomId || nanoid(10);
    if (currentRoomId !== roomId) {
      dispatch(setRoomId(currentRoomId));
      return; // Wait for roomId to be set
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
  }, [userId, roomId, roomIdFromUrl, dispatch]);

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

  return {
    sendCodeChange,
    sendCursorUpdate,
  };
}
