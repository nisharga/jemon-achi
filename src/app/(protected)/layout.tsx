import PageLoader from '@/components/PageLoader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { StoreProvider } from '@/providers/store-provider';
import { ReactNode, Suspense } from 'react';
import { AppHeader, AppSidebar } from './components';

// Dashboard shell. Access is enforced by `src/proxy.ts` (JWT cookie) and the
// profile request in `useLoggedInUser` — this layout only draws the chrome.
// The Redux store is scoped to the admin area (see also `(auth)/layout.tsx`).
export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<PageLoader />}>
            <StoreProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className='overflow-x-hidden'>
                        <AppHeader />
                        <div className='min-h-[calc(100svh-64px)] overflow-x-hidden bg-secondary p-2 md:p-4 lg:p-5'>
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </StoreProvider>
        </Suspense>
    );
}
