import React from 'react';
import Link from 'next/link';
import { cn } from '@/admin/lib/utils';
import { buttonVariants } from '@/admin/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import OrderDetails from './_components/order-details';

const OrderDetailsPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    return (
        <section className='flex w-full flex-col gap-6'>
            <Link
                href='/admin/orders'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit print:hidden'
                    })
                )}
            >
                <ChevronLeft /> Back to Orders
            </Link>
            {/* <h1 className="text-2xl font-medium">Product Details</h1> */}
            <OrderDetails id={id as string} />
        </section>
    );
};

export default OrderDetailsPage;
