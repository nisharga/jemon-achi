'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { selectCartCount } from '@/shop/redux/features/cart-slice';
import { useAppSelector } from '@/shop/redux/store';

/** Cart icon with the number of items in the cart. */
export default function CartButton() {
    // The cart lives in the browser (localStorage), so the count is only shown after mount.
    const isMounted = useMounted();
    const count = useAppSelector(selectCartCount);
    const label = count > 0 ? `Cart, ${count} items` : 'Cart';

    return (
        <Link
            href='/cart'
            aria-label={label}
            className='text-primary-ink relative p-1 hover:text-black'
        >
            <ShoppingCart className='size-5' aria-hidden='true' />
            {isMounted && count > 0 && (
                <span className='nav-cart absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary'>
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
