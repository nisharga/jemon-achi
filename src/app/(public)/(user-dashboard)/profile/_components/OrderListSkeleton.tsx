import { Skeleton } from '@/components/public/ui/skeleton';

/** Grey placeholder rows while orders load. */
export default function OrderListSkeleton({ rows }: { rows: number }) {
    return (
        <div className='divide-y divide-gray-100'>
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className='flex items-center gap-4 px-6 py-4'>
                    <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-40' />
                        <Skeleton className='h-3 w-24' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                </div>
            ))}
        </div>
    );
}
