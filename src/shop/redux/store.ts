import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import {
    type TypedUseSelectorHook,
    useDispatch,
    useSelector
} from 'react-redux';

import baseSlice from './features/baseSlice';
import cartReducer from './features/cart-slice';
import userReducer from './features/userSlice';
import apiSlice from './api/api-slice';
import apiSliceAuth from './api/api-slice-auth';
import imgbbFileUploadApi from './api/file-upload-api';
import customerApi from './api/customer-api';

const rootReducer = combineReducers({
    utils: baseSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [apiSliceAuth.reducerPath]: apiSliceAuth.reducer,
    [imgbbFileUploadApi.reducerPath]: imgbbFileUploadApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    cart: cartReducer,
    user: userReducer
});

// localStorage only exists in the browser. On the server use a no-op storage
// (silences "redux-persist failed to create sync storage").
const storage =
    typeof window !== 'undefined'
        ? createWebStorage('local')
        : {
              getItem: () => Promise.resolve(null),
              setItem: (_key: string, value: string) => Promise.resolve(value),
              removeItem: () => Promise.resolve()
          };

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['cart']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// One store per request on the server and one per page load in the browser
// (created in ProviderWrapper), so requests never share state.
export const makeStore = () =>
    configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                // Redux's two development-only checks time every action with
                // Date.now(). Data hooks dispatch while a page is prerendered, and
                // Next.js (cacheComponents) stops on clock reads during prerender.
                // These checks never run in production, so nothing changes there.
                immutableCheck: false,
                serializableCheck: false
            })
                .concat(apiSlice.middleware)
                .concat(apiSliceAuth.middleware)
                .concat(imgbbFileUploadApi.middleware)
                .concat(customerApi.middleware)
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];

// Restores the persisted cart from localStorage (browser only).
export const makePersistor = (store: AppStore) => persistStore(store);

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
