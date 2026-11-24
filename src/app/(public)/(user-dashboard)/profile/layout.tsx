import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import DashboardShell from './_components/DashboardShell';
import { PageSkeleton } from '@/components';

// Only logged-in customers reach these pages (see src/proxy.ts).
export const metadata: Metadata = {
    title: 'My account',
    robots: { index: false, follow: false }
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
    // The menu highlights the current page (reads the URL), so it needs <Suspense>.
    return (
        <Suspense fallback={<PageSkeleton />}>
            <DashboardShell>{children}</DashboardShell>
        </Suspense>
    );
}
