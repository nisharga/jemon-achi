'use client';
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { toast } from 'sonner'; // or your preferred toast library
import Image from 'next/image';
import { Container } from '../common/container';
import { Icons } from '../global/Icons';
import { iconContainer, iconItem } from '@/shop/lib/variants';
import { motion } from 'framer-motion';
import SocialIcon from '../global/SocialIcon';

import ScrollUp from '../common/ScrollUp';
import Link from 'next/link';
import {
    bottom_footer_links,
    companyLinks,
    FACEBOOK_URL,
    quickLinks,
    shopLinks,
    styleLinks,
    AMAZON_URL,
    FACEBOOK_GROUP_URL,
    INSTAGRAM_URL,
    TIKTOK_URL,
    YOUTUBE_URL
} from '@/shop/config/footer_links';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: any) => {
        e.preventDefault();
        if (!email) return;
        toast.success(email);
        setEmail('');
    };

    return (
        <footer className='mt-4 bg-white pt-8 pb-8 text-primary shadow-sm sm:mt-8 lg:pt-16'>
            <Container className='mx-auto px-2 sm:px-6 md:px-10'>
                {/* Main Footer Content */}
                <div className='lg::gap-10 mb-4 grid grid-cols-2 gap-2 sm:mb-16 md:grid-cols-3 lg:grid-cols-5'>
                    <FooterColumn title='Quick Links' links={quickLinks} />

                    <FooterColumn title='Shop' links={shopLinks} />
                    <FooterColumn title='Company' links={companyLinks} />
                    <FooterColumn title='Shop By Style' links={styleLinks} />

                    {/* Newsletter Section */}
                    <div className='col-span-2 space-y-2 lg:col-span-1 lg:space-y-6'>
                        <h3 className='sm-medium mb-8 tracking-widest uppercase'>
                            Come hang with us
                        </h3>
                        {/*   <div className="relative group">
              <Image
                src="/sample_banner.png"
                alt="Community"
                width={500}
                height={500}
                className="rounded-xl w-full aspect-[16/9] object-cover border-2 border-white/20"
              />
              <div className="absolute -top-5 lg:-top-3 right-3 lg:-right-3 bg-[#E96E6E] text-[10px] font-medium px-3 py-1 rounded-full uppercase rotate-12 shadow-lg">
                Subscribe Now!
              </div>
            </div> */}

                        {/* Email Input Field */}
                        {/* <form
              onSubmit={handleSubscribe}
              className="relative flex items-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="shadow-sm w-full bg-primary/10 border border-primary/30 rounded-full py-3 px-6 placeholder:text-primary/60 focus:outline-none focus:bg-primary/20 transition-all sm-normal-primary"
                required
              />
              <button
                type="submit"
                className="absolute right-2 p-2 bg-black text-white rounded-full hover:scale-105 transition-transform"
              >
                <Send size={18} />
              </button>
            </form> */}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='flex flex-col items-center justify-between gap-2 border-t border-primary/20 pt-4 pb-12 sm:pt-8 md:flex-row lg:gap-6 lg:pb-0'>
                    <div className='xs-normal flex flex-wrap justify-center gap-4 tracking-wide uppercase opacity-80'>
                        {bottom_footer_links.map((link, i) => (
                            <Link
                                key={i}
                                href={link?.url}
                                target='_blank'
                                className='hover:underline'
                            >
                                {link?.name}
                            </Link>
                        ))}
                    </div>

                    <div className='flex gap-6'>
                        <motion.div
                            variants={iconContainer}
                            initial='hidden'
                            whileInView='show'
                            viewport={{ once: true }}
                            className='flex items-center gap-4'
                        >
                            <motion.div variants={iconItem}>
                                <SocialIcon href={FACEBOOK_URL}>
                                    <Icons.Facebook className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                                <SocialIcon href={FACEBOOK_GROUP_URL}>
                                    <Icons.FacebookGroup className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                                <SocialIcon href={INSTAGRAM_URL}>
                                    <Icons.Instagram className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                                <SocialIcon href={YOUTUBE_URL}>
                                    <Icons.Youtube className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                                <SocialIcon href={TIKTOK_URL}>
                                    <Icons.Tiktok className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                                <SocialIcon href={AMAZON_URL}>
                                    <Icons.Amazon className='h-5 w-5 cursor-pointer transition-opacity hover:opacity-70' />
                                </SocialIcon>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </Container>

            <ScrollUp />
        </footer>
    );
};

// Small Sub-component for Footer Columns
const FooterColumn = ({
    title,
    links
}: {
    title: string;
    links: { name: string; url: string }[];
}) => (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='space-y-2 lg:space-y-4'
    >
        <h4 className='sm-medium tracking-widest uppercase'>{title}</h4>

        <ul className='space-y-1 lg:space-y-2'>
            {links?.map((link, index) => (
                <li key={index}>
                    <Link
                        href={link?.url || '/'}
                        className='sm-normal-primary inline-block opacity-80 transition-all hover:translate-x-1 hover:opacity-100'
                    >
                        {link?.name}
                    </Link>
                </li>
            ))}
        </ul>
    </motion.div>
);

export default Footer;
