import AppHeader from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/admin-sidebar';
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='overflow-x-hidden'>
                <AppHeader />
                <div className='min-h-[calc(100svh-64px)] overflow-x-hidden bg-secondary p-2 md:p-4 lg:p-5 print:bg-background'>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
