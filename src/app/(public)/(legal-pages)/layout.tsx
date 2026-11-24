import type { ReactNode } from 'react';
import StorefrontFrame from '@/shop/components/shared/StorefrontFrame';

export default function Layout({ children }: { children: ReactNode }) {
    return <StorefrontFrame>{children}</StorefrontFrame>;
}
