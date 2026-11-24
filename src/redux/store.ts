import { configureStore } from '@reduxjs/toolkit';
import apiSlice from '@/redux/api-queries/api-slice';
import imgbbFileUploadApi from '@/redux/api-queries/file-upload-api';
// import { fraudApi } from "./api-queries/fraudApi";

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [imgbbFileUploadApi.reducerPath]: imgbbFileUploadApi.reducer
        // [fraudApi.reducerPath]: fraudApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Redux's two development-only checks time every action with
            // Date.now(). Data hooks dispatch while a page is prerendered, and
            // Next.js (cacheComponents) stops on clock reads during prerender.
            // These checks never run in production, so nothing changes there.
            immutableCheck: false,
            serializableCheck: false
        }).concat(
            apiSlice.middleware,
            imgbbFileUploadApi.middleware
            // fraudApi.middleware
        )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
