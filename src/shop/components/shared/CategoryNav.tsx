import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';

const CategoryNav = () => {
    const { data, isLoading } = useGetAllCategoriesQuery({});
    const categories = data?.data?.data ?? [];

    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    const menuVariants: Variants = {
        hidden: { opacity: 0, y: -5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, ease: 'easeOut' }
        },
        exit: { opacity: 0, y: -5, transition: { duration: 0.15 } }
    };

    if (isLoading)
        return <div className='h-10 animate-pulse rounded bg-gray-50' />;

    return (
        <nav
            className='relative min-w-full border-gray-100 bg-white'
            onMouseLeave={() => setHoveredCategory(null)}
        >
            <div className='mx-auto max-w-7xl px-4'>
                <ul className='flex h-12 items-center justify-center gap-8'>
                    {categories.map((category: any) => {
                        // Check if API has subcategories for this category
                        const hasSubmenu =
                            category.subcategories &&
                            category.subcategories.length > 0;
                        const isHovered = hoveredCategory === category._id;

                        return (
                            <li
                                key={category._id}
                                className='relative flex h-full items-center'
                                onMouseEnter={() =>
                                    hasSubmenu &&
                                    setHoveredCategory(category._id)
                                }
                            >
                                <Link
                                    href={`/category/${category.slug}`}
                                    className='group relative flex items-center py-1 text-[12px] font-medium text-gray-700 transition-colors hover:text-primary'
                                >
                                    {category.name_en}
                                    {hasSubmenu && (
                                        <ChevronDown
                                            className={`ml-1 h-3 w-3 transition-transform duration-300 ${
                                                isHovered
                                                    ? 'rotate-180 text-primary'
                                                    : 'text-gray-400'
                                            }`}
                                        />
                                    )}
                                    {/* Minimal Underline */}
                                    <span
                                        className={`absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-primary transition-transform duration-300 ${
                                            isHovered
                                                ? 'scale-x-100'
                                                : 'scale-x-0'
                                        }`}
                                    ></span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <AnimatePresence>
                {hoveredCategory && (
                    <motion.div
                        variants={menuVariants}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        className='absolute top-full left-0 z-50 w-full border-t border-gray-50 bg-white pt-8 pb-10 shadow-xl'
                    >
                        <div className='mx-auto grid max-w-7xl grid-cols-6 gap-x-8 gap-y-10 px-4'>
                            {/* Find parent and map its subcategories */}
                            {categories
                                ?.find((c: any) => c._id === hoveredCategory)
                                ?.subcategories?.map((sub: any) => (
                                    <div
                                        key={sub._id}
                                        className='flex flex-col space-y-3'
                                    >
                                        {/* Subcategory Header: /category/electricity */}
                                        <Link
                                            href={`/sub-category/${sub.slug}`}
                                            className='group w-fit'
                                            onClick={() =>
                                                setHoveredCategory(null)
                                            }
                                        >
                                            <h3 className='relative text-[13px] font-medium tracking-wider text-black uppercase'>
                                                {sub.name_en}
                                                {/* Persistent Underline */}
                                                <span className='absolute -bottom-1 left-0 h-[1px] w-full bg-black'></span>
                                            </h3>
                                        </Link>

                                        {/* Sub-subcategories List: /category/electricity/iphone */}
                                        <ul className='space-y-2'>
                                            {sub.sub_subcategories?.map(
                                                (nested: any) => (
                                                    <li key={nested._id}>
                                                        <Link
                                                            href={`/sub-sub-category/${nested.slug}`} //${sub.slug}
                                                            className='block text-[13px] leading-relaxed font-medium text-gray-600 transition-colors hover:text-primary'
                                                            onClick={() =>
                                                                setHoveredCategory(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            {nested.name_en}
                                                        </Link>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default CategoryNav;
