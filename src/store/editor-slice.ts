import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Cursor {
  userId: string;
  userName: string;
  position: { line: number; column: number };
  color: string;
}

interface EditorState {
  code: string;
  language: string;
  roomId: string | null;
  userId: string;
  userName: string;
  cursors: Record<string, Cursor>;
  isConnected: boolean;
}

const initialState: EditorState = {
  code: "// Start coding...\n",
  language: "javascript",
  roomId: null,
  userId: "",
  userName: "Anonymous",
  cursors: {},
  isConnected: false,
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    updateCursor: (state, action: PayloadAction<Cursor>) => {
      state.cursors[action.payload.userId] = action.payload;
    },
    removeCursor: (state, action: PayloadAction<string>) => {
      delete state.cursors[action.payload];
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const {
  setCode,
  setLanguage,
  setRoomId,
  setUserId,
  setUserName,
  updateCursor,
  removeCursor,
  setConnected,
} = editorSlice.actions;

export default editorSlice.reducer;
