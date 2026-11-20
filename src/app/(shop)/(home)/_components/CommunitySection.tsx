import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Container } from '@/shop/components/common/container';
import { useGetCommunityPostsQuery } from '@/shop/redux/api/offer';
import SectionTitle from '@/shop/components/global/SectionTitle';
import { getMediaUrl } from '@/shop/lib/get-media-url';

const CommunitySection = () => {
    const { data, isLoading } = useGetCommunityPostsQuery({});
    const posts = data ?? [];
    const instagramLink =
        'https://www.instagram.com/griipbuddy/reel/DS-Okwmku5S/?hl=en';

    if (isLoading)
        return <div className='h-96 animate-pulse rounded-2xl bg-gray-50' />;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 sm:mb-4'>
                <SectionTitle title='From the Griipbuddy Community' />
            </div>

            <div className='grid grid-cols-2 gap-2 md:grid-cols-4 lg:gap-4'>
                {posts?.map((post, index) => (
                    <motion.a
                        key={post?.id}
                        href={instagramLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        whileHover={{ y: -5 }}
                        initial={{
                            opacity: 0,
                            y: index % 2 === 0 ? -30 : 30
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}
                        // "once: false" makes it animate every time it enters the screen
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: 'easeOut'
                        }}
                        className='group relative aspect-[4/5] overflow-hidden rounded-lg shadow-sm'
                    >
                        <Image
                            src={getMediaUrl(post?.url)}
                            alt={post?.handle}
                            fill
                            className='object-cover transition-transform duration-700 group-hover:scale-105'
                        />

                        {/* Handle Overlay */}
                        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4'>
                            <p className='sm-normal-primary tracking-wide text-white'>
                                {post?.handle}
                            </p>
                        </div>

                        {/* Subtle Hover Border */}
                        <div className='pointer-events-none absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-white/20' />
                    </motion.a>
                ))}
            </div>
        </Container>
    );
};

export default CommunitySection;
