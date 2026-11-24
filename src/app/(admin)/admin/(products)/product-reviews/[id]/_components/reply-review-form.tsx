'use client';

import { useRouter } from 'next/navigation';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { toast } from 'sonner';
import { useState } from 'react';

// UI Components
import { Card, CardContent, CardHeader } from '@/components/ui/admin-card';
import { Button } from '@/components/ui/admin-button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/admin-badge';
import { Star, User, Calendar, CheckCircle2 } from 'lucide-react';

import {
    useGetReviewByIdQuery,
    useReviewAdminMutation
} from '@/redux/admin/api/reviews-api';
import { getMediaUrl } from '@/utils/get-media-url';
import Image from 'next/image';

const ReplyReviewForm = ({ id }: { id: string }) => {
    const [replyContent, setReplyContent] = useState('');
    const router = useRouter();

    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_UPDATE
        ]
    });

    const [replyReview, { isLoading: isReplyLoading }] =
        useReviewAdminMutation();
    const { data, isLoading } = useGetReviewByIdQuery({ review_id: id });

    const review: any = data?.data;
    console.log('review: ', review);

    const downVote = review?.helpfulVotes?.downvotes || 0;
    const upvotes = review?.helpfulVotes?.upvotes || 0;
    const product_name = review?.product?.name || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return toast.error('Please enter a reply');

        try {
            const res = await replyReview({
                payload: { content: replyContent },
                review_id: id
            }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Reply submitted successfully');
                setReplyContent(''); // Clear form
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to submit reply');
        }
    };

    if (!isPermissionLoading && !hasPermission) return <PermissionErrorCard />;
    if (isPermissionLoading || isLoading) return <PermissionLoaderCard />;

    return (
        <div className='space-y-8'>
            <div className='flex items-center justify-between'>
                <h1 className='section-title text-primary'>Review Details</h1>
                <Badge className='rounded-full bg-primary px-4 py-1 text-white'>
                    {review?.status?.toUpperCase()}
                </Badge>
            </div>

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                {/* --- Left Column: Review Info & Media --- */}
                <div className='space-y-4 lg:col-span-2'>
                    <Card className='border-none bg-white shadow-sm'>
                        <CardHeader className='border-b'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-1'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={
                                                i < review?.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200'
                                            }
                                        />
                                    ))}
                                </div>
                                {review?.verifiedPurchase && (
                                    <div className='sm-normal flex items-center text-green-600'>
                                        <CheckCircle2
                                            size={16}
                                            className='mr-1'
                                        />{' '}
                                        Verified Purchase
                                    </div>
                                )}
                            </div>
                            <h2 className='two-xl-medium'>
                                {review?.title || 'No Title Provided'}
                            </h2>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <p className='base-normal leading-relaxed text-gray-800 italic'>
                                {review?.content}
                            </p>
                        </CardContent>
                    </Card>

                    {/* --- Reply Form --- */}
                    <div className='space-y-4'>
                        <h3 className='sm-medium text-primary uppercase'>
                            Submit a Reply
                        </h3>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <Textarea
                                placeholder='Write your professional response...'
                                className='base-normal min-h-[150px] border-gray-200 focus-visible:ring-primary'
                                value={replyContent}
                                onChange={(e) =>
                                    setReplyContent(e.target.value)
                                }
                                disabled={isReplyLoading}
                            />
                            <div className='flex items-center justify-end space-x-4'>
                                <button
                                    type='button'
                                    onClick={() => router.back()}
                                    className='sm-normal-gray'
                                >
                                    Cancel
                                </button>
                                <Button
                                    type='submit'
                                    className='rounded-md bg-primary px-10 py-6 text-white hover:opacity-90'
                                    disabled={
                                        isReplyLoading || !replyContent.trim()
                                    }
                                >
                                    <span className='btn-label font-bold'>
                                        {isReplyLoading
                                            ? 'Submitting...'
                                            : 'Post Reply'}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- Right Column: Metadata Details --- */}
                <div className='space-y-6'>
                    <Card className='border-none bg-gray-50 shadow-sm'>
                        <CardContent className='space-y-4 px-4'>
                            <div className='space-y-4'>
                                <h4 className='base-medium border-b pb-2 text-primary'>
                                    Product Details
                                </h4>

                                {/* Display Media if exists */}
                                {review?.media?.length > 0 && (
                                    <div className=''>
                                        {review.media.map(
                                            (item: any, idx: number) => (
                                                <div key={idx} className='w-40'>
                                                    <div className='mb-2 aspect-square overflow-hidden rounded-md border bg-gray-100'>
                                                        <Image
                                                            src={getMediaUrl(
                                                                item.url
                                                            )}
                                                            width={500}
                                                            height={500}
                                                            alt='Review attachment'
                                                            className='h-full w-full object-cover'
                                                        />
                                                    </div>
                                                    <p className='text-gray-800'>
                                                        {product_name}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                <div className='flex items-start space-x-3'>
                                    <User
                                        size={18}
                                        className='mt-1 text-primary'
                                    />
                                    <div>
                                        <p className='sm-normal text-primary'>
                                            Customer
                                        </p>
                                        <p className='sm-normal'>
                                            {review?.user?.name ||
                                                'Anonymous User'}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-start space-x-3'>
                                    <User
                                        size={18}
                                        className='mt-1 text-primary'
                                    />
                                    <div>
                                        <p className='sm-normal text-primary'>
                                            Helpful vote
                                        </p>
                                        <p className='sm-normal'>
                                            Upvote: {upvotes}, DownVote:{' '}
                                            {downVote}
                                        </p>
                                    </div>
                                </div>

                                {/*  <div className="flex items-start space-x-3">
                  <Package size={18} className="text-primary mt-1" />
                  <div>
                    <p className="sm-normal  text-primary">Product ID</p>
                    <p className="xs-normal break-all font-mono">
                      {review?.product}
                    </p>
                  </div>
                </div> */}

                                {/* <div className="flex items-start space-x-3">
                  <ShoppingCart size={18} className="text-primary mt-1" />
                  <div>
                    <p className="sm-normal  text-primary">Order ID</p>
                    <p className="xs-normal break-all font-mono">
                      {review?.order?.id}
                    </p>
                  </div>
                </div> */}

                                <div className='flex items-start space-x-3'>
                                    <Calendar
                                        size={18}
                                        className='mt-1 text-primary'
                                    />
                                    <div>
                                        <p className='sm-normal text-primary'>
                                            Reviewed On
                                        </p>
                                        <p className='xs-normal'>
                                            {new Date(
                                                review?.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Show existing reply if available */}
                            {review?.sellerReply?.content && (
                                <div className='mt-6 rounded-lg border border-primary/10 bg-primary/5 p-4'>
                                    <p className='sm-semibold mb-2 text-primary'>
                                        Previous Reply:
                                    </p>
                                    <p className='sm-normal-gray italic'>
                                        {review.sellerReply.content}
                                    </p>
                                    <p className='mt-2 text-[10px] text-gray-400 uppercase'>
                                        Replied on:{' '}
                                        {new Date(
                                            review.sellerReply.repliedAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReplyReviewForm;
