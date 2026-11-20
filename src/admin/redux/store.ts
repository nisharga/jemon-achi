import { configureStore } from '@reduxjs/toolkit';
import apiSlice from '@/admin/redux/api-queries/api-slice';
import imgbbFileUploadApi from '@/admin/redux/api-queries/file-upload-api';
// import { fraudApi } from "./api-queries/fraudApi";

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [imgbbFileUploadApi.reducerPath]: imgbbFileUploadApi.reducer
        // [fraudApi.reducerPath]: fraudApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            apiSlice.middleware,
            imgbbFileUploadApi.middleware
            // fraudApi.middleware
        )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
