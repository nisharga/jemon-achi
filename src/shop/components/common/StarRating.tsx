import { Star } from 'lucide-react';
import { cn } from '@/shop/lib/utils';

interface StarRatingProps {
    rating: number; // e.g., 3.7
    reviews?: number;
    size?: number;
    showCount?: boolean;
    className?: string;
}

const StarRating = ({
    rating = 0,
    reviews = 0,
    size = 16,
    showCount = true,
    className
}: StarRatingProps) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className='flex'>
                {[...Array(5)].map((_, i) => {
                    const starIndex = i + 1;
                    // Calculate fill percentage for this specific star
                    // If rating is 3.7:
                    // Star 1,2,3 get 100%. Star 4 gets 0.7 (70%). Star 5 gets 0%.
                    const fillPercentage = Math.max(
                        0,
                        Math.min(100, (rating - i) * 100)
                    );

                    return (
                        <div
                            key={i}
                            className='relative'
                            style={{ width: size, height: size }}
                        >
                            {/* Gray Background Star (Empty) */}
                            <Star
                                size={size}
                                className='text-gray-300'
                                fill='none'
                                strokeWidth={1.5}
                            />

                            {/* Gold Filled Star (Layered on top with a clip) */}
                            <div
                                className='absolute top-0 left-0 overflow-hidden text-[#C49B3B]'
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    size={size}
                                    fill='currentColor'
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {showCount && (
                <span className='text-sm font-normal text-[#C49B3B]'>
                    {rating.toFixed(1)} ({reviews})
                </span>
            )}
        </div>
    );
};

export default StarRating;
