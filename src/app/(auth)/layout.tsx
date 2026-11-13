import PageLoader from '@/components/PageLoader';
import { StoreProvider } from '@/providers/store-provider';
import { ReactNode, Suspense } from 'react';

// Auth pages: no marketing header/footer, no dashboard shell — just a centred card.
// The Redux store lives here (not in the root layout) so the marketing site stays
// static and Redux-free; Suspense lets Next.js stream this subtree per request.
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<PageLoader />}>
            <StoreProvider>
                <section className='grid min-h-screen w-full place-items-center px-4 py-10'>
                    {children}
                </section>
            </StoreProvider>
        </Suspense>
    );
}
