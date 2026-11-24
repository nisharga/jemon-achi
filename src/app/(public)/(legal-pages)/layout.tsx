import type { ReactNode } from 'react';
import { StorefrontFrame } from '@/components';

export default function Layout({ children }: { children: ReactNode }) {
    return <StorefrontFrame>{children}</StorefrontFrame>;
}
