import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import DashboardShell from './_components/DashboardShell';

// Only logged-in customers reach these pages (see src/proxy.ts).
export const metadata: Metadata = {
    title: 'My account',
    robots: { index: false, follow: false }
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}
