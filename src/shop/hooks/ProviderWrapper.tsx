'use client';
import { makePersistor, makeStore } from '@/shop/redux/store';
import React, { FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';

const ProviderWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
    // Created once per mount: a fresh store per server request, and a store
    // that survives re-renders (and hot reloads of this file) in the browser.
    const [store] = useState(makeStore);

    useEffect(() => {
        makePersistor(store);
    }, [store]);

    return (
        <Provider store={store}>
            {children}
            <Toaster position='top-center' richColors />
        </Provider>
    );
};

export default ProviderWrapper;
