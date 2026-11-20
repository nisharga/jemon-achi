'use client';
import CopyrightYear from '@/components/CopyrightYear';
import { API_BASE_URL } from '@/configs/env';
import { FOOTER_SECTION } from '@/static';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const { title, description, widgets, socialMedias } = FOOTER_SECTION;

const TheFooter = () => {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/subscriptions/emails`, {
                email: newsletterEmail
            });
            setMessage('Thank you for joining our newsletter!');
            setNewsletterEmail('');
        } catch {
            setMessage('Something went wrong please try again!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className='relative pt-20'>
            <div className='container'>
                <div className='grid grid-cols-2 gap-14 sm:grid-cols-12 xl:gap-20'>
                    <div className='col-span-2 sm:col-span-6 lg:col-span-4'>
                        <h2 className='mb-8 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {title}
                        </h2>
                        <p className='mb-8'>{description}</p>
                        <div className='mb-4 flex h-11 items-center justify-center overflow-hidden rounded-full border border-primary-800 p-0.5'>
                            <input
                                value={newsletterEmail}
                                onChange={(e) =>
                                    setNewsletterEmail(e.target.value)
                                }
                                type='email'
                                placeholder='Enter your email'
                                className='h-full w-full bg-transparent px-4 outline-none'
                            />
                            <button
                                disabled={isLoading}
                                onClick={() => void onSubmit()}
                                className='h-full w-[180px] rounded-full bg-primary-800 px-4 text-white'
                            >
                                {isLoading ? 'Loading...' : 'Subscribe'}
                            </button>
                        </div>
                        {message ? (
                            <p className='text-sm text-success'>{message}</p>
                        ) : null}
                    </div>
                    {(widgets ?? []).map(({ heading, links }, i: number) => (
                        <div className='sm:col-span-6 lg:col-span-3' key={i}>
                            <h2 className='mb-8 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                {heading}
                            </h2>
                            <ul className='flex flex-col gap-2'>
                                {(links ?? []).map(({ label, url }) => (
                                    <li key={url}>
                                        <Link
                                            className='hover:text-primary-800'
                                            href={url}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className='flex-col sm:col-span-6 lg:col-span-2 xl:flex'>
                        <h2 className='mb-8 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {socialMedias.heading}
                        </h2>
                        <ul className='flex gap-4'>
                            {(socialMedias.links ?? []).map(
                                ({ name, url, icon }, i: number) => (
                                    <li key={i}>
                                        <Link
                                            aria-label={name}
                                            target='_blank'
                                            className='hover:text-primary-800'
                                            href={url}
                                        >
                                            <span className='[&>svg]:hover:fill-primary-800 dark:[&>svg]:fill-gray-200 dark:[&>svg]:hover:fill-primary-900'>
                                                {icon}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className='absolute right-0 bottom-0 -z-10'>
                <Image
                    src={'/images/footer-bg.webp'}
                    width={445}
                    height={392}
                    sizes='445px'
                    alt=''
                />
            </div>

            <div className='container pt-10 pb-6'>
                <div className='flex flex-col items-center justify-between gap-6 sm:flex-row'>
                    <div className='flex gap-4'>
                        <p className='flex items-center gap-2'>
                            Powered by{' '}
                            <Link
                                target='_blank'
                                href={'https://www.nexlent.com'}
                            >
                                <Image
                                    src={'/images/nexlent-logo.svg'}
                                    className='h-4 w-auto'
                                    width={0}
                                    height={0}
                                    unoptimized
                                    alt='nexlent technical partner'
                                />
                            </Link>{' '}
                            &{' '}
                            <Link
                                className='leading-none font-medium tracking-wide text-[#39bbea] uppercase'
                                href={'https://yesteck.net/'}
                                target='_blank'
                            >
                                <span className='text-[#f8ae25]'>Yes</span>teck
                            </Link>
                        </p>
                    </div>
                    <p className='text-center text-sm text-gray-800 dark:text-gray-200'>
                        © <CopyrightYear /> TruUp.io All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default TheFooter;
