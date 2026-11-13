import { Icons } from '@/components/Icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
interface IProps {
    title: string;
    excerpt: string;
    contents: string;
    thumbnail: string;
}

const BlogPostCard: React.FC<IProps> = ({ title, excerpt, thumbnail }) => {
    return (
        <div className='flex flex-col gap-5'>
            <div>
                <Image
                    src={thumbnail}
                    className='w-full'
                    alt={title}
                    width={100}
                    height={150}
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
