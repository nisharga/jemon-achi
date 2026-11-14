import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { AppHeader, AppSidebar } from '../components';

// Dashboard shell (staff only — enforced by `src/proxy.ts`).
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='overflow-x-hidden'>
                <AppHeader />
                <div className='min-h-[calc(100svh-64px)] overflow-x-hidden bg-secondary p-2 md:p-4 lg:p-5'>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
