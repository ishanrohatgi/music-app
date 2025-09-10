import { configureStore } from "@reduxjs/toolkit";
import homeSlice from "./slices/homeData";
import playerSlice from "./slices/playerSlice"; // import the player slice reducer

export const store = configureStore({
  reducer: {
    home: homeSlice,
    player: playerSlice, // add player slice here
  },
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
