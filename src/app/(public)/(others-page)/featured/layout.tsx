import { Suspense, type ReactNode } from 'react';
import PageSkeleton from '@/shop/components/common/PageSkeleton';
import ListingLayout from './_components/ListingLayout';

// The listing reads the URL (useParams), so it renders inside <Suspense>:
// the rest of the page is sent at once and this part follows in the same response.
export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ListingLayout>{children}</ListingLayout>
        </Suspense>
    );
}
