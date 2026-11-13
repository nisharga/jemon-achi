import { AOSInit } from '@/utils/Aos';
import { ReactNode } from 'react';
import { TheFooter, TheHeader } from './components';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <AOSInit />
            <TheHeader />
            {children}
            <TheFooter />
        </>
    );
}
