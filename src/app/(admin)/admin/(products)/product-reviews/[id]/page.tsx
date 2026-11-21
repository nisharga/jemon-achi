import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';
import ReplyReviewForm from './_components/reply-review-form';

const ProductDetailsPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    return (
        <section className='flex flex-col gap-6'>
            <Link
                href='/admin/product-reviews'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Review
            </Link>

            <ReplyReviewForm id={id} />
        </section>
    );
};

export default ProductDetailsPage;
