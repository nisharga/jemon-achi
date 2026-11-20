'use client';

import React from 'react';
import {
    Smartphone,
    Laptop,
    Dock,
    PenTool,
    Watch,
    Shield,
    Headphones,
    Cable,
    Headphones as WirelessHeadphones,
    Plug,
    Battery,
    Usb,
    Zap,
    Volume2,
    Headphones as OverheadHeadphones,
    Smartphone as CoverGlass
} from 'lucide-react';
import { Container } from '@/shop/components/common/container';

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
}

const categories: Category[] = [
    {
        id: 'phones-tablets',
        name: 'Phones & Tablets',
        icon: <Smartphone className='size-8 lg:size-12' />
    },
    {
        id: 'macbook',
        name: 'MacBook',
        icon: <Laptop className='size-8 lg:size-12' />
    },
    {
        id: 'hubs-docks',
        name: 'Hubs & Docks',
        icon: <Dock className='size-8 lg:size-12' />
    },
    {
        id: 'stylus',
        name: 'Stylus',
        icon: <PenTool className='size-8 lg:size-12' />
    },
    {
        id: 'smart-watch',
        name: 'Smart Watch',
        icon: <Watch className='size-8 lg:size-12' />
    },
    {
        id: 'watch-strap',
        name: 'Watch Strap',
        icon: <Shield className='size-8 lg:size-12' />
    },
    {
        id: 'airpods',
        name: 'Airpods',
        icon: <Headphones className='size-8 lg:size-12' />
    },
    {
        id: 'wired-headphone',
        name: 'Wired Headphone',
        icon: <Cable className='size-8 lg:size-12' />
    },
    {
        id: 'wireless-headphone',
        name: 'Wireless Headphone',
        icon: <WirelessHeadphones className='size-8 lg:size-12' />
    },
    {
        id: 'power-adapter',
        name: 'Power Adapter',
        icon: <Plug className='size-8 lg:size-12' />
    },
    {
        id: 'power-bank',
        name: 'Power Bank',
        icon: <Battery className='size-8 lg:size-12' />
    },
    {
        id: 'cable-interconnects',
        name: 'Cable & Interconnects',
        icon: <Usb className='size-8 lg:size-12' />
    },
    {
        id: 'wireless-charger',
        name: 'Wireless Charger',
        icon: <Zap className='size-8 lg:size-12' />
    },
    {
        id: 'speakers',
        name: 'Speakers',
        icon: <Volume2 className='size-8 lg:size-12' />
    },
    {
        id: 'overhead-headphones',
        name: 'Overhead Headphones',
        icon: <OverheadHeadphones className='size-8 lg:size-12' />
    },
    {
        id: 'cover-glass',
        name: 'Cover & Glass',
        icon: <CoverGlass className='size-8 lg:size-12' />
    }
];

const ShopByCategory: React.FC = () => {
    return (
        <section className='py-16'>
            <Container>
                {/* Header */}
                <div className='mb-8 text-center'>
                    <h2 className='mb-2 text-2xl tracking-tight text-gray-900'>
                        FEATURED CATEGORIES
                    </h2>
                    <p className='mx-auto max-w-2xl text-sm text-gray-600'>
                        Get your desired product from featured category
                    </p>
                </div>

                <div className='grid grid-cols-4 gap-x-2 gap-y-2.5 lg:grid-cols-8 lg:gap-y-3'>
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className='group flex cursor-pointer flex-col items-center rounded-xl border border-gray-100 bg-[#f6f8fa] p-2 transition-all duration-300 lg:px-6 lg:py-3'
                        >
                            <div className='mb-4 flex size-10 items-center justify-center rounded-xl bg-gray-50 transition-colors duration-300 group-hover:bg-blue-50 lg:size-[70px]'>
                                <div className='text-gray-400 transition-colors duration-300 group-hover:text-primary'>
                                    {category.icon}
                                </div>
                            </div>

                            {/* Category Name */}
                            <h3 className='text-center text-[10px] leading-tight font-medium text-gray-500 transition-colors duration-300 group-hover:text-primary lg:text-sm'>
                                {category.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default ShopByCategory;
