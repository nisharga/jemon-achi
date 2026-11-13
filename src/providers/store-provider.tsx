'use client';

import { makeStore, type AppStore } from '@/redux/store';
import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    // Lazily create one store per provider instance.
    const [store] = useState<AppStore>(makeStore);

    return <Provider store={store}>{children}</Provider>;
};
