import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/public/ui/button';

/** Shown instead of an order list when the customer has not ordered yet. */
export default function NoOrders() {
    return (
        <div className='flex flex-col items-center gap-3 px-6 py-12 text-center'>
            <div className='flex size-12 items-center justify-center rounded-full bg-gray-100'>
                <ShoppingBag className='size-6 text-gray-600' />
            </div>
            <p className='font-medium text-gray-900'>No orders yet</p>
            <p className='max-w-xs text-sm text-gray-600'>
                When you buy something, you can follow it here.
            </p>
            <Button asChild className='mt-2'>
                <Link href='/'>Start shopping</Link>
            </Button>
        </div>
    );
}
