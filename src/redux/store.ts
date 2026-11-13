import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api-queries/api-slice';

/** Factory so each request/render tree gets its own store (App Router safe). */
export const makeStore = () =>
    configureStore({
        reducer: {
            [apiSlice.reducerPath]: apiSlice.reducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware)
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
