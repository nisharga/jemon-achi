import React from 'react';
import Link from 'next/link';
import { cn } from '@/admin/lib/utils';
import { buttonVariants } from '@/admin/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import ReplyReviewForm from './_components/reply-review-form';

const ProductDetailsPage = async ({
    params
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;
    return (
        <section className='flex flex-col gap-6'>
            <Link
                href='/admin/product-faqs'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Faq
            </Link>

            <ReplyReviewForm slug={slug} />
        </section>
    );
};

export default ProductDetailsPage;
