'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Container } from '@/shop/components/common/container';

import CategoryPage from './[name]/page';
import { useParams } from 'next/navigation';
import { useGetAllRelatedProductsQuery } from '@/shop/redux/api/product-api';
import {
    FilterHeader,
    Pagination,
    RangeSelector,
    SubCategoryFilter
} from '@/shop/components/filter';
import { Button } from '@/shop/components/ui/button';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';

interface ViewCategoryLayoutProps {
    children: React.ReactNode;
}

const ViewCategoryLayout: React.FC<ViewCategoryLayoutProps> = ({
    children
}) => {
    const [slug, setSlug] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('');

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<
        string | null
    >(null);

    // pagination states
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

    // price ranger
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(3000);

    // RTK Query now reacts to search and sort changes automatically
    const params = useParams();
    const routeValue = params.name as string; // This is "laptops"

    const [productCategorySlug, setProductCategorySlug] = useState<string>('');

    useEffect(() => {
        if (routeValue) {
            const decoded = decodeURIComponent(routeValue);

            // CASE 1: It's an ID list (ids=123,456)
            if (decoded.includes('ids=')) {
                const extracted = decoded.split('ids=')[1];
                setProductCategorySlug(extracted);
            }
            // CASE 2: It's a clean slug (laptops)
            else {
                setProductCategorySlug(decoded);
            }
        }
    }, [routeValue]);

    // 4. API Query
    const { data, isLoading, isFetching } = useGetAllRelatedProductsQuery(
        {
            page,
            limit,
            min_price: minPrice,
            max_price: maxPrice,
            category_slug: productCategorySlug,
            subcategory_slug: selectedSubCategory ?? undefined,
            sortBy: 'price', // Always sort by price for this page
            sortOrder: sortBy, // Use "asc" as fallback if dropdown is empty
            search: searchQuery
        },
        { skip: !productCategorySlug }
    );

    const { data: categoryData, isLoading: isCategoryLoading } =
        useGetAllCategoriesQuery({});

    // =========== fetching ==========================
    const productData = data?.data?.data || [];
    const totalProducts = data?.data?.meta?.total || 0;
    const resCategories = categoryData?.data?.data ?? [];
    const parentCategory = resCategories?.find(
        (cat: any) => cat?.slug === productCategorySlug
    );
    const subCategoryData = parentCategory?.subcategories;

    // The lifting state logic
    const handleSubCategoryChange = (category: any) => {
        setSelectedSubCategory(category);
    };

    //  whenever filters change (Important!)
    useEffect(() => {
        setPage(1);
    }, [selectedSubCategory, searchQuery, sortBy]);

    // Reset page to 1 when price changes
    useEffect(() => {
        setPage(1);
    }, [minPrice, maxPrice]);
    return (
        <div className='bg-grey-50 relative z-0 min-h-screen border'>
            {/* Header */}
            <FilterHeader
                title={routeValue}
                totalItems={data?.data?.meta?.total || 0}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onSearch={setSearchQuery}
                onMobileFilterOpen={() => setIsMobileFilterOpen(true)}
            />

            {/* Mobile Filter Sidebar */}
            <div className='relative lg:hidden'>
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm transition-all duration-300 ${
                        isMobileFilterOpen
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                    onClick={() => setIsMobileFilterOpen(false)}
                />

                {/* Sidebar Container */}
                <div
                    className={`fixed inset-y-0 right-0 z-[1000] flex w-full max-w-xs transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                        isMobileFilterOpen
                            ? 'translate-x-0'
                            : 'translate-x-full'
                    }`}
                >
                    {/* Header - Fixed at top */}
                    <div className='flex flex-shrink-0 items-center justify-between border-b p-4'>
                        <h3 className='font-bold text-gray-900'>Filters</h3>
                        <button
                            onClick={() => setIsMobileFilterOpen(false)}
                            className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'
                        >
                            <X className='h-6 w-6' />
                        </button>
                    </div>

                    {/* Filter Content - This area scrolls */}
                    <div className='flex-1 space-y-8 overflow-y-auto overscroll-contain p-4'>
                        {/* 1. Price Range */}
                        <div className='space-y-4'>
                            <h4 className='text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                                Price Range
                            </h4>
                            <RangeSelector
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                                maxLimit={5000}
                                onFilterGo={() => {
                                    console.log(minPrice, maxPrice);
                                }}
                            />
                        </div>

                        {/* 2. Categories */}
                        <div className='space-y-4 pb-10'>
                            <h4 className='text-sm font-semibold tracking-wider text-gray-500 uppercase'>
                                Categories
                            </h4>
                            {/* Categories */}
                            <SubCategoryFilter
                                data={subCategoryData} // Passing the array from your RTK Query
                                selectedId={selectedSubCategory}
                                onSelectionChange={(category) =>
                                    handleSubCategoryChange(category)
                                }
                                isLoading={isCategoryLoading}
                            />
                        </div>
                    </div>

                    {/* Footer Action - Fixed at bottom */}
                    <div className='flex-shrink-0 border-t bg-white p-4'>
                        <Button
                            onClick={() => setIsMobileFilterOpen(false)}
                            className='w-full bg-primary py-6 text-lg font-semibold text-white shadow-lg shadow-primary/20'
                        >
                            Show Results
                        </Button>
                    </div>
                </div>
            </div>

            {/* PC Filter Sidebar */}
            <Container className='px-2 lg:px-0'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                    {/* Sidebar Filters - Desktop */}
                    <div className='hidden w-64 flex-shrink-0 py-4 lg:block'>
                        <div className='space-y-6 rounded-lg border bg-white p-4 shadow-sm'>
                            <div>
                                <h3 className='mb-3 font-semibold text-gray-900'>
                                    Filter By
                                </h3>
                            </div>

                            <RangeSelector
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                                maxLimit={5000} // Optional: set based on your business logic
                                onFilterGo={() =>
                                    console.log(
                                        'Filtering between:',
                                        minPrice,
                                        maxPrice
                                    )
                                }
                            />

                            {/* Categories */}
                            <SubCategoryFilter
                                data={subCategoryData} // Passing the array from your RTK Query
                                selectedId={selectedSubCategory}
                                onSelectionChange={(category) =>
                                    handleSubCategoryChange(category)
                                }
                                isLoading={isCategoryLoading}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className='flex-1 py-4'>
                        <div className='grid grid-cols-2 gap-2 xs:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4'>
                            <CategoryPage
                                setSlug={setSlug}
                                productData={productData}
                                isLoading={isLoading || isFetching}
                            />
                        </div>
                        <Pagination
                            isLoading={isLoading}
                            page={page}
                            setPage={setPage}
                            limit={limit}
                            total={totalProducts}
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ViewCategoryLayout;
