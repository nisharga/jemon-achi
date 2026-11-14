import PageLoader from '@/components/PageLoader';
import { StoreProvider } from '@/providers/store-provider';
import { ReactNode, Suspense } from 'react';

// Everything behind a login: the admin dashboard (`/admin`) and the customer
// area (`/profile`). Access and role checks happen in `src/proxy.ts`; each
// area draws its own chrome in its own layout. The Redux store is scoped here
// (not in the root layout) so the marketing site stays static and Redux-free.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<PageLoader />}>
            <StoreProvider>{children}</StoreProvider>
        </Suspense>
    );
}
