import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import EditPurchaseForm from './_components/edit-purchase-form';

const PurchaseEditPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center gap-2'>
                <Link
                    href='/admin/purchase/all'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Edit Purchase</h1>
            </div>
            <EditPurchaseForm id={id} />
        </section>
    );
};

export default PurchaseEditPage;
