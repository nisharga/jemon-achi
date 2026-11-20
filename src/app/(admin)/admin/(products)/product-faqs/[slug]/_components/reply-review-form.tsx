'use client';

import { useRouter } from 'next/navigation';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Button } from '@/admin/components/ui/button';
import { Textarea } from '@/admin/components/ui/textarea';
import {
    useGetFaqBySlugQuery,
    useUpdateFaqMutation
} from '@/admin/redux/api-queries/faq-api';
import Image from 'next/image';
import { getMediaUrl } from '@/admin/utils/get-media-url';

const ReplyReviewForm = ({ slug }: { slug: string }) => {
    const router = useRouter();
    const [answer, setAnswer] = useState('');

    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_UPDATE
        ]
    });

    const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
    const { data, isLoading } = useGetFaqBySlugQuery({ slug: slug });
    console.log('data: ', data);

    const faq = data?.data;

    // Sync existing answer if it exists
    useEffect(() => {
        if (faq?.answer) setAnswer(faq.answer);
    }, [faq]);

    if (!isPermissionLoading && !hasPermission) return <PermissionErrorCard />;
    if (isPermissionLoading || isLoading) return <PermissionLoaderCard />;

    const handleReply = async () => {
        try {
            const payload = {
                status: 'active',
                answer: answer
            };

            // Assuming your update mutation takes the ID or slug + body
            await updateFaq({ faq_id: slug, payload: payload }).unwrap();

            toast.success('FAQ replied successfully!');
            router.push('/admin/product-faqs'); // Adjust path as needed
        } catch (error) {
            toast.error('Failed to update FAQ');
            console.error(error);
        }
    };

    return (
        <div className='space-y-8 rounded-lg border bg-white p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-primary'>FAQ Details</h1>
            </div>

            <div className='flex gap-4 space-y-4'>
                <div className='space-y-4'>
                    <div>
                        <h3 className='font-semibold text-gray-700'>
                            Question:
                        </h3>
                        <p className='text-lg italic'>{faq?.question}</p>
                    </div>

                    <div className='space-y-2'>
                        <label className='font-semibold text-gray-700'>
                            Your Answer:
                        </label>
                        <Textarea
                            placeholder='Type your reply here...'
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows={5}
                        />
                    </div>

                    <Button
                        onClick={handleReply}
                        disabled={isUpdating || !answer.trim()}
                        className='w-full md:w-auto'
                    >
                        {isUpdating ? 'Submitting...' : 'Submit Reply'}
                    </Button>
                </div>

                <div className='h-[170px] overflow-hidden rounded-lg border border-border bg-muted/30 p-4'>
                    <h3 className='mb-3 font-semibold text-gray-700'>
                        Product:
                    </h3>

                    <div className='flex flex-col gap-4 md:flex-row'>
                        {/* Product Thumbnail */}
                        {faq?.product?.thumbnail && (
                            <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-white'>
                                <Image
                                    src={getMediaUrl(faq?.product?.thumbnail)}
                                    alt={faq.product.name}
                                    className='h-full w-full object-cover'
                                    width={500}
                                    height={500}
                                />
                            </div>
                        )}

                        <div className='grid w-full grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2'>
                            {/* Name and SKU */}
                            <div className='col-span-1 md:col-span-2'>
                                <p className='text-lg font-medium text-primary'>
                                    {faq?.product?.name}
                                </p>
                                <p className='pb-1 text-xs text-muted-foreground'>
                                    SKU: {faq?.product?.sku}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    Slug: {faq?.product?.slug}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyReviewForm;
