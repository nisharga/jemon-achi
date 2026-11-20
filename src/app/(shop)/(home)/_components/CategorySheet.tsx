'use client';
import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/shop/components/ui/sheet';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';
import { getMediaUrl } from '@/shop/lib/get-media-url';

interface ICategory {
    _id: number | string;
    name_en: string;
    slug: string;
    media?: any;
}

const resolveImage = (media: any[] = []) => {
    let img = media?.find((m: any) => m.size === 'VERTICAL')?.image;
    if (!img)
        img = media?.find(
            (m: any) => m.size === 'HORIZONTAL' || m.size === 'SQUARE'
        )?.image;
    if (!img) img = media?.[0]?.image;
    return img;
};

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CategorySheet = ({ open, onOpenChange }: IProps) => {
    const { data } = useGetAllCategoriesQuery({});
    const categories: ICategory[] = data?.data?.data ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side='bottom'
                className='max-h-[85vh] rounded-t-2xl px-4 pt-3 pb-6'
            >
                {/* Drag handle */}
                <div className='mx-auto mb-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-300' />

                <h2 className='shrink-0 px-2 text-center text-lg leading-snug font-semibold text-primary sm:text-xl'>
                    Choose a category to find the products you&apos;re looking
                    for!
                </h2>

                <div className='mt-4 no-scrollbar grid grid-cols-4 gap-x-3 gap-y-5 overflow-y-auto pb-2 md:grid-cols-6 xl:grid-cols-7'>
                    {categories.map((category) => {
                        const image = resolveImage(category?.media);
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
                                <p className='line-clamp-1 text-center text-xs font-medium text-primary sm:text-sm'>
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
