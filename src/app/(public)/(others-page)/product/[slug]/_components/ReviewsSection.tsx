import StarRating from '@/components/public/common/StarRating';
import ErrorState from '@/components/public/global/ErrorState';
import { formatDate } from '@/lib/public-utils';
import {
    useGetReviewRatingByProductIdQuery,
    useGetReviewsByProductIdQuery,
    useUpdateReviewMutation
} from '@/redux/public/api/review';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import React from 'react';

const ReviewsSection = ({ slug }: { slug: string }) => {
    const { data, isLoading, isError, error, refetch } =
        useGetReviewsByProductIdQuery({ slug });

    const { data: ratingData, isLoading: isLoadingRating } =
        useGetReviewRatingByProductIdQuery({ slug });

    const reviews = data?.data;
    const averageRating = ratingData?.data?.averageRating ?? 0;
    const totalReviews = ratingData?.data?.totalReviews ?? 0;
    const rating = ratingData?.data?.rating ?? [];

    return (
        <div className='mx-auto max-w-7xl p-6 font-sans text-[#1a1a1a]'>
            <h2 className='mb-6 text-2xl font-bold tracking-tight uppercase'>
                Reviews
            </h2>

            {isError ? (
                <ErrorState isError={isError} onRetry={refetch} />
            ) : isLoading ? (
                <ReviewSkeleton />
            ) : !reviews ? (
                <div className='py-20 text-center text-gray-600'>
                    No reviews yet. Be the first to rate this!
                </div>
            ) : (
                <div className='animate-fadeIn'>
                    {/* Header Section: Snapshot & Overall Rating */}
                    <div className='mb-12 flex flex-col gap-12 border-b pb-10 md:flex-row'>
                        {/* Rating Snapshot */}
                        <div className='flex-1'>
                            <h3 className='mb-4 font-bold'>Rating Snapshot</h3>
                            <p className='mb-4 text-sm text-gray-600'>
                                Select a row below to filter reviews.
                            </p>
                            <div className='space-y-2'>
                                {rating?.map?.((item: any, index: number) => (
                                    <ReviewBar
                                        key={index}
                                        barIndex={rating.length - index}
                                        value={item.percentage}
                                        countLabel={
                                            item?.count?.toString() ?? '0'
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Overall Rating */}
                        <div className='md:w-1/3'>
                            <h3 className='mb-4 font-bold'>Overall Rating</h3>
                            <div className='flex flex-col items-start gap-4'>
                                <div className='text-6xl leading-none font-medium'>
                                    {averageRating.toFixed(1)}
                                </div>
                                <StarRating
                                    rating={averageRating}
                                    reviews={totalReviews}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Side-by-Side Most Helpful Reviews */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {reviews?.map?.((review: any) => {
                            return (
                                <ReviewCard
                                    key={review?._id}
                                    title={review?.title}
                                    data={review}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;

// Sub-component for the Review Cards
const ReviewCard = ({ data }: any) => {
    const main_review = data?.title;
    const reply = data?.content;
    const rating = data?.rating ?? 0;
    const date = data?.createdAt;
    const verifiedPurchase = data?.verifiedPurchase;
    const user = data?.order?.customer_name ?? 'Anonymous';
    const upvotes = data?.helpfulVotes?.upvotes ?? 0;
    const downvotes = data?.helpfulVotes?.downvotes ?? 0;

    const [updateReview, { isLoading: isUpdateLoading }] =
        useUpdateReviewMutation();

    const handleClick = async (voteType: 'upvote' | 'downvote') => {
        await updateReview({
            id: data?._id,
            payload: {
                vote: voteType
            }
        });
    };

    return (
        <div className='flex h-full flex-col justify-between rounded-xl border border-gray-300 p-6'>
            <div>
                <div className='mb-2 text-sm text-[#7a5c12]'>
                    {'★'.repeat(5)}
                    {'☆'.repeat(5 - rating)}
                </div>
                <h5 className='mb-4 text-xl font-bold'>{main_review}</h5>
                <div className='mb-2 flex items-center gap-2'>
                    <span className='text-sm font-bold underline'>{user}</span>
                    {verifiedPurchase && (
                        <span className='flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase'>
                            ✓ Verified Purchaser
                        </span>
                    )}
                </div>
                <p className='mb-4 text-xs text-gray-600'>{formatDate(date)}</p>
                <p className='mb-4 line-clamp-3 leading-relaxed text-gray-700'>
                    {reply}
                </p>
            </div>

            <div className='flex items-center justify-between border-t border-gray-100'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                    <div>
                        <button
                            onClick={() => handleClick('upvote')}
                            className='cursor-pointer'
                        >
                            <ThumbsUp size={14} />
                        </button>{' '}
                        {upvotes} found helpful
                    </div>
                    <div>
                        <button
                            onClick={() => handleClick('downvote')}
                            className='cursor-pointer'
                        >
                            <ThumbsDown size={14} className='-mb-0.5' />
                        </button>{' '}
                        {downvotes} not helpful
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReviewSkeleton = () => (
    <div className='animate-pulse'>
        <div className='mb-12 flex gap-12'>
            <div className='flex-1 space-y-4'>
                <div className='h-4 w-1/4 bg-gray-200'></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='h-3 w-full bg-gray-100'></div>
                ))}
            </div>
            <div className='w-1/3 space-y-4'>
                <div className='h-20 w-full bg-gray-200'></div>
            </div>
        </div>
        <div className='grid grid-cols-2 gap-6'>
            <div className='h-64 rounded-xl bg-gray-100'></div>
            <div className='h-64 rounded-xl bg-gray-100'></div>
        </div>
    </div>
);

interface ReviewBarProps {
    title?: string; // e.g., "5 stars"
    barIndex: number; // 1 to 5
    value: number; // The percentage (0-100)
    countLabel?: string; // e.g., "222"
}

const ReviewBar: React.FC<ReviewBarProps> = ({
    title,
    barIndex,
    value,
    countLabel = '0'
}) => {
    // Ensure value stays between 0 and 100
    const widthPercentage = Math.min(Math.max(value, 0), 100);

    return (
        <div className='group flex items-center gap-4 text-sm'>
            {/* Star Label / Title */}
            <span className='w-12 cursor-pointer whitespace-nowrap underline transition-colors hover:text-[#7a5c12]'>
                {title || `${barIndex} stars`}
            </span>

            {/* Progress Bar Container */}
            <div className='h-3 flex-1 overflow-hidden rounded-sm bg-gray-200'>
                <div
                    className='h-full bg-[#b38e44] transition-all duration-500 ease-out'
                    style={{ width: `${widthPercentage}%` }}
                ></div>
            </div>

            {/* Count Label */}
            <span className='w-8 text-right text-gray-600'>{countLabel}</span>
        </div>
    );
};
