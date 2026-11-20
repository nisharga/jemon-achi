import { CardTitle } from '@/shop/components/ui/card';
import React from 'react';

const CartTitle = ({
    title,
    icon
}: {
    title: string;
    icon: React.ReactNode;
}) => {
    return (
        <CardTitle className='flex items-center gap-3 text-lg font-normal'>
            <div className='rounded-lg bg-primary p-2'>{icon}</div>
            {title}
        </CardTitle>
    );
};

export default CartTitle;
