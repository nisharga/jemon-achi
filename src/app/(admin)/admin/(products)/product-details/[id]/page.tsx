import React from 'react';
import ProductDetails from './_components/product-details';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';

const ProductDetailsPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    return (
        <section className='flex flex-col gap-6'>
            <Link
                href='/admin/products'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Products
            </Link>
            {/* <h1 className="text-2xl font-medium">Product Details</h1> */}
            <ProductDetails id={id as string} />
        </section>
    );
};

export default ProductDetailsPage;
