'use client';
import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/components/public/ui/sheet';
import { getCategoryImage } from '@/lib/category-image';
import type { ProductCategory } from '@/types/public/storefront';
import { getMediaUrl } from '@/lib/get-media-url';

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Fetched on the server with the rest of the home page. */
    categories: ProductCategory[];
}

const CategorySheet = ({ open, onOpenChange, categories }: IProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side='bottom'
                className='max-h-[85vh] rounded-t-2xl px-4 pt-3 pb-6'
            >
                {/* Drag handle */}
                <div className='mx-auto mb-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-300' />

                <h2 className='text-primary-ink shrink-0 px-2 text-center text-lg leading-snug font-semibold sm:text-xl'>
                    Choose a category to find the products you&apos;re looking
                    for!
                </h2>

                <div className='mt-4 no-scrollbar grid grid-cols-4 gap-x-3 gap-y-5 overflow-y-auto pb-2 md:grid-cols-6 xl:grid-cols-7'>
                    {categories.map((category) => {
                        const image = getCategoryImage(category.media);
                        return (
                            <Link
                                key={category?._id}
                                href={`/category/${category?.slug}`}
                                onClick={() => onOpenChange(false)}
                                className='group flex flex-col items-center gap-2'
                            >
                                <div className='aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-[#F3F3F3] transition-colors group-hover:border-primary'>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getMediaUrl(image)}
                                        alt={category?.name_en}
                                        loading='lazy'
                                        className='h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105'
                                    />
                                </div>
                                <p className='text-primary-ink line-clamp-1 text-center text-xs font-medium sm:text-sm'>
                                    {category?.name_en}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CategorySheet;
