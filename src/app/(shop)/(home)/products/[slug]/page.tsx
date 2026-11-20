'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Heart, SlidersHorizontal, LucideIcon } from 'lucide-react';
import {
    useGetAllProductsQuery,
    useGetFilterExploreProductsQuery
} from '@/shop/redux/api/product-api';
import Image from 'next/image';
import { Container } from '@/shop/components/common/container';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/shop/components/ui/dialog';
import { cn, slugToText, SORT_MAPPING } from '@/shop/lib/utils';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useParams } from 'next/navigation';
import { useGetAllSubSubCategoryBySubCategorySlugQuery } from '@/shop/redux/api/category-api';
import Link from 'next/link';
import { InfiniteScroll } from '@/shop/components/global/InfiniteScroll';
import { EmptyProducts } from './_components/EmptyProduct';

const ProductPage = () => {
    // items
    const [page, setPage] = useState(1);

    const params = useParams();
    // Extract name safely (params.name could be a string or string[])
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params.slug;

    const { data, isLoading: isLoadingSubSubCategory } =
        useGetAllSubSubCategoryBySubCategorySlugQuery({
            slug
        });
    const subSubCategories = data?.data ?? [];
    const collectionName = subSubCategories?.subSubCategories?.name_en || slug;
    const sub_subcategories = subSubCategories?.sub_subcategories || [];

    const [showFilter, setShowFilter] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');
    const currentSort = SORT_MAPPING[sortBy] || {};

    // ✅ DO THIS INSTEAD:
    const {
        data: allProduct,
        isLoading,
        isFetching, // Use isFetching for the "Loading more" spinner
        isError
    } = useGetAllProductsQuery({
        subcategory: slug,
        page,
        ...currentSort // This spreads sortBy, sortOrder, and top_selling
    });

    // This list will automatically grow because of your API 'merge' logic
    const products = allProduct?.data?.products || [];
    const meta = allProduct?.data?.meta;

    // Update hasMore logic to use the merged products array
    const hasMore = products.length < (meta?.total || 0);

    const loadNextPage = () => {
        if (!hasMore || isFetching) return;
        setPage((currentPage) => currentPage + 1);
    };

    useEffect(() => {
        setPage(1);
    }, [sortBy]);

    // For the initial load only
    if (isLoading && page === 1) return <ProductSkeleton />;

    // Handle empty state
    if (!isLoading && products.length === 0)
        return <EmptyProducts categoryName={slugToText(slug || '')} />;
    return (
        <Container className='mx-auto min-h-[calc(100vh-100px)] px-2 py-4 sm:px-6 md:px-10 lg:py-10'>
            {/* Header Bar */}
            <div className='mb-4 flex items-center justify-between lg:mb-8'>
                {/* PC TOGGLE: Only updates showFilter state */}
                <div className='hidden md:block'>
                    <h3 className='two-xl-medium mb-4'>
                        {slugToText(slug || '')}
                    </h3>
                    <FilterToggle
                        isOpen={showFilter}
                        onClick={() => setShowFilter(!showFilter)}
                    />
                </div>

                {/* MOBILE DIALOG: Controls isMobileMenuOpen state */}
                <div className='flex w-full items-center justify-between gap-2 md:hidden'>
                    <h3 className='lg-normal'>{slugToText(slug || '')}</h3>
                    <div className='flex w-full flex-1 justify-end gap-2'>
                        <Dialog
                            open={isMobileMenuOpen}
                            onOpenChange={setIsMobileMenuOpen}
                        >
                            <DialogTrigger asChild>
                                <button className='flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white'>
                                    <SlidersHorizontal size={14} /> Filter &
                                    Sort
                                </button>
                            </DialogTrigger>
                            <DialogContent className='top-auto bottom-0 w-[75vw] translate-x-[-50%] translate-y-0 rounded-t-[2rem] p-6 outline-none sm:max-w-[300px]'>
                                <DialogHeader className='mb-4'>
                                    <div className='mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200' />
                                    <DialogTitle className='text-left text-sm tracking-tighter'>
                                        Filter & Sort
                                    </DialogTitle>
                                </DialogHeader>

                                <FilterContent
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    // This will close the dialog only on mobile
                                    onSelect={() => setIsMobileMenuOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className='flex gap-4 lg:gap-10'>
                <AnimatePresence>
                    {showFilter && (
                        <motion.aside
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className='hidden w-64 shrink-0 md:block'
                        >
                            <div className='sticky top-24'>
                                <FilterContent
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    // Pass null or nothing for PC so the sidebar stays open
                                    onSelect={null}
                                    // sub_subcategories
                                    collectionName={collectionName}
                                    sub_subcategories={sub_subcategories}
                                />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Product Grid */}

                <div className='grid flex-1 grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6'>
                    <InfiniteScroll
                        hasMore={hasMore}
                        isLoading={isLoading || isFetching}
                        next={loadNextPage}
                    >
                        {products?.map((product: any) => {
                            return (
                                <motion.a
                                    layout
                                    key={product._id}
                                    className='group block cursor-pointer'
                                    href={`/product/${product?.slug}`}
                                >
                                    <div className='relative mb-4 overflow-hidden rounded-xl bg-[#F5F5F5]'>
                                        {/*  <button className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </button> */}
                                        <Image
                                            width={600}
                                            height={800}
                                            src={getMediaUrl(
                                                product?.media?.[0]?.image ||
                                                    product?.thumbnail
                                            )}
                                            alt={product?.name}
                                            className='h-full w-full object-contain transition-transform duration-500 group-hover:scale-110'
                                        />
                                    </div>
                                    <h3 className='mb-1 text-xs leading-snug font-bold tracking-tight uppercase md:text-sm'>
                                        {product?.name}
                                    </h3>
                                </motion.a>
                            );
                        })}
                    </InfiniteScroll>
                </div>
            </div>
        </Container>
    );
};

export default ProductPage;

const FilterContent = ({
    sortBy,
    setSortBy,
    onSelect,
    collectionName,
    sub_subcategories
}: any) => {
    const handleSortChange = (option: any) => {
        setSortBy(option);
        if (onSelect) onSelect(); // Closes dialog on mobile
    };

    const handleCollectionClick = () => {
        if (onSelect) onSelect(); // Closes dialog on mobile
    };

    return (
        <div className='space-y-8'>
            {/* Sort Section */}
            <div>
                <h3 className='mb-4 text-sm font-bold tracking-tighter uppercase'>
                    Sort By
                </h3>
                <div className='space-y-3'>
                    {[
                        'Newest',
                        'Popularity',
                        'Discount',
                        'Price: Low To High',
                        'Price: High To Low'
                    ].map((option) => (
                        <label
                            key={option}
                            className='group flex cursor-pointer items-center gap-3'
                        >
                            <input
                                type='radio'
                                name='sort'
                                checked={sortBy === option}
                                onChange={() => handleSortChange(option)}
                                className='h-4 w-4 accent-black'
                            />
                            <span
                                className={`text-sm ${sortBy === option ? 'font-bold' : 'font-medium opacity-70'} transition-opacity group-hover:opacity-100`}
                            >
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Collection Section */}
            {/* <div>
        <h3 className="font-bold uppercase text-sm mb-4 tracking-tighter">
          {collectionName}
        </h3>
        <div className="grid grid-cols-3 gap-x-2 gap-y-6">
          {sub_subcategories?.map((item: any) => (
            <Link
              href={`/products/${item?.slug}`}
              key={item?._id}
              onClick={handleCollectionClick}
              className="text-center cursor-pointer group block"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden ring-1 ring-gray-200 group-hover:ring-black transition-all">
                <Image
                  src={getMediaUrl(item?.media?.[0]?.image)}
                  alt={item?.name_en}
                  width={500}
                  height={500}
                  className="w-full h-full"
                />
              </div>
              <p className="text-[10px] leading-tight font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                {item?.name_en}
              </p>
            </Link>
          ))}
        </div>
      </div> */}
        </div>
    );
};

interface FilterToggleProps {
    isOpen: boolean;
    onClick: () => void;
    showIcon?: LucideIcon;
    hideIcon?: LucideIcon;
    className?: string;
}

const FilterToggle = ({
    isOpen,
    onClick,
    showIcon: ShowIcon = Filter,
    hideIcon: HideIcon = X,
    className
}: FilterToggleProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 rounded-full bg-[#64A68C] px-5 py-2.5 text-white',
                'text-xs font-bold tracking-tight uppercase lg:text-sm',
                'shadow-sm transition-all duration-200 hover:bg-[#528d75] active:scale-95',
                className
            )}
        >
            {isOpen ? (
                <>
                    <HideIcon size={16} strokeWidth={2.5} />
                    <span>Hide Filters</span>
                </>
            ) : (
                <>
                    <ShowIcon size={16} strokeWidth={2.5} />
                    <span>Show Filters</span>
                </>
            )}
        </button>
    );
};

const ProductSkeleton = () => (
    <div className='mx-auto grid max-w-[1400px] grid-cols-4 gap-6 px-10 py-10'>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className='space-y-4'>
                <div className='aspect-[3/4] animate-pulse rounded-xl bg-gray-100' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-gray-100' />
                <div className='h-4 w-1/4 animate-pulse rounded bg-gray-100' />
            </div>
        ))}
    </div>
);
