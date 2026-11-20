'use client';
import React, { useState, useEffect } from 'react';
import { Box, User, ShoppingCart, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { ExternalWhatsAppLink } from '@/shop/components/product/WhatsApp';
import { useAppSelector } from '@/shop/redux/store';
import { selectCartCount } from '@/shop/redux/features/cart-slice';
import { useUser } from '@/shop/hooks/use-user';

const BottomMenu = () => {
    // Track if component has mounted to avoid hydration mismatch
    // const [isMounted, setIsMounted] = useState(false);
    // user get - use state to avoid hydration mismatch
    /* const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  console.log("user: ", user);

  useEffect(() => {
    setIsMounted(true);
    setUser(getUser());
  }, []); */

    // ============== Cart API  ================
    const { user, isLoading: isUserLoading, isMounted } = useUser();
    const cartCount = useAppSelector(selectCartCount);
    const totalItems = isMounted ? cartCount : 0;

    const menuLinks = [
        {
            name: 'Home',
            href: '/',
            icon: Home
        },
        {
            name: 'Pre-Order',
            href: '/pre-order',
            icon: Box
        },
        {
            name: 'Cart',
            href: '/cart',
            icon: ShoppingCart,
            count: `${Number(totalItems)}`
        },
        {
            name: 'Message',
            href: `${ExternalWhatsAppLink}`,
            icon: MessageCircle
        },
        {
            name:
                !isMounted || isUserLoading
                    ? '...'
                    : user
                      ? 'Profile'
                      : 'Login',
            href: user ? '/profile' : '/login',
            icon: User,
            isLoading: !isMounted || isUserLoading // Track loading state
        }
    ];

    return (
        <div className='fixed bottom-0 z-50 flex w-full items-center justify-between bg-white p-4 text-primary shadow-sm md:hidden'>
            {menuLinks?.map((link, index) => (
                <Link
                    key={index}
                    href={link?.href}
                    className='relative flex flex-col items-center text-xs font-light'
                >
                    <link.icon className='xs-normal mb-1 h-5 w-5' />
                    <span className='xs-normal'>{link?.name}</span>
                    {isMounted &&
                        link?.count !== undefined &&
                        Number(link?.count) > 0 && (
                            <span className='absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/40 bg-primary pt-0.5 text-[11px] font-medium text-white backdrop-blur'>
                                {link?.count}
                            </span>
                        )}
                </Link>
            ))}
        </div>
    );
};

export default BottomMenu;
