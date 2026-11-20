import { Icons } from '@/components/Icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
interface IProps {
    title: string;
    excerpt: string;
    contents: string;
    thumbnail: string;
    /** Load the image immediately (card is above the fold). */
    eager?: boolean;
    /** Preload with high priority (only the page's LCP image). */
    preload?: boolean;
}

const BlogPostCard: React.FC<IProps> = ({
    title,
    excerpt,
    thumbnail,
    eager = false,
    preload = false
}) => {
    return (
        <div className='flex flex-col gap-5'>
            <div>
                <Image
                    src={thumbnail}
                    className='w-full'
                    alt={title}
                    loading={eager || preload ? 'eager' : 'lazy'}
                    preload={preload}
                    fetchPriority={preload ? 'high' : undefined}
                    width={387}
                    height={213}
                    sizes='(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'
                />
            </div>
            <div>
                <h3 className='mb-2 line-clamp-2 text-lg font-semibold text-gray-900 lg:text-xl dark:text-gray-100'>
                    {title}
                </h3>
                <p className='line-clamp-2'>{excerpt}</p>
            </div>
            <div className='flex items-center gap-3 py-3'>
                <Link
                    href={'#'}
                    className='font-medium text-primary-900 dark:text-purple-500'
                >
                    Read more
                </Link>
                <Icons.RightArrow className='stroke-primary-900 dark:stroke-primary-500' />
            </div>
        </div>
    );
};

export default BlogPostCard;
