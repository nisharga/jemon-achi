import { TheFooter, TheHeader } from '@/app/(public)/components';
import { ReactNode } from 'react';

// Customer area (regular users only — enforced by `src/proxy.ts`). It reuses
// the marketing header/footer so it feels like part of the public site.
export default function ProfileLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <TheHeader />
            <section className='container section-gap min-h-[60vh]'>
                {children}
            </section>
            <TheFooter />
        </>
    );
}
