'use client';

import { Button } from '@/components/ui/admin-button';
import { useGetAllProductsQuery } from '@/redux/admin/api/product-api';
import Link from 'next/link';
import React, { Suspense, useEffect, useState } from 'react';
import { ProductsTable } from './_components/products-table';
import { Input } from '@/components/ui/admin-input';
import useDebounce from '@/hooks/use-debounce';
import Pagination from '@/components/shared/pagination';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/admin-label';
import { useGetAllBusinessLocationsQuery } from '@/redux/admin/api/business-location-api';
import { IBusiness_location } from '@/types/admin/business-location';
import { useQueryState } from 'nuqs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { TCategory } from '@/types/admin/category';
import { useGetAllCategoriesQuery } from '@/redux/admin/api/category-api';
import { TSubCategory } from '@/types/admin/sub-category';
import { useGetAllSubCategoriesQuery } from '@/redux/admin/api/subcategory-api';

const ProductsPageComponent = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });
    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [sku, setSku] = useState('');
    const debouncedSkuQuery = useDebounce(sku);
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');
    const [category, setCategory] = useQueryState('category');
    const [subCategory, setSubCategory] = useQueryState('subCategory');

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];
    // === get all categories ===
    const { data: categoryData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categories = categoryData?.data?.data;
    const categoryOptions = categories?.map((category: TCategory) => ({
        value: category?._id,
        label: category?.name_en
    }));
    // === get all sub categories ===
    const { data: subCategoryData } = useGetAllSubCategoriesQuery({
        page: 1,
        limit: 100
    });
    const subCategories = subCategoryData?.data?.subcategories;
    const subCategoryOptions = subCategories?.map(
        (subCategory: TSubCategory) => ({
            value: subCategory?._id,
            label: subCategory?.name_en
        })
    );

    // === get all products ===
    const { data, isLoading, isFetching } = useGetAllProductsQuery(
        {
            page,
            limit,
            searchQuery: '',
            sku: debouncedSkuQuery,
            businessLocationId: businessLocation,
            categoryId: category,
            subcategoryId: subCategory
        },
        { refetchOnMountOrArgChange: true }
    );
    const products = data?.data?.data;
    const productsMeta = data?.data?.meta;

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit, sku]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    All Products ({productsMeta?.total})
                </h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/create-product'>Create Product</Link>
                </Button>
            </div>
            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion type='single' collapsible defaultValue='item-1'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger
                            isHideChevron={true}
                            className='hover: cursor-pointer rounded-b-none border-b p-4 text-lg font-medium hover:no-underline'
                        >
                            <span className='flex items-center gap-2 text-emerald-600'>
                                <Filter className='size-5' /> Filter
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='grid gap-6 px-4 pt-4 md:grid-cols-2 lg:grid-cols-5'>
                                <div className='space-y-2'>
                                    <Label>SKU</Label>
                                    <Input
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder='Search by sku'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Category</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setCategory(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={category ? category : 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {categoryOptions?.map(
                                                (
                                                    c: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={c?.value}
                                                    >
                                                        {c?.label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Sub Category</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setSubCategory(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={
                                            subCategory ? subCategory : 'all'
                                        }
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select sub category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {subCategoryOptions?.map(
                                                (
                                                    s: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={s?.value}
                                                    >
                                                        {s?.label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Business Location</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={
                                            businessLocation
                                                ? businessLocation
                                                : 'all'
                                        }
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {businessLocationOptions?.map(
                                                (
                                                    businessLocation: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            businessLocation?.value
                                                        }
                                                    >
                                                        {
                                                            businessLocation?.label
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            {/* table */}
            <ProductsTable
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
            />
            {/* pagination */}
            <div className='rounded-lg bg-background p-2 shadow-md'>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalItems={productsMeta?.total}
                />
            </div>
        </div>
    );
};

const ProductsPage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <ProductsPageComponent />
        </Suspense>
    );
};

export default ProductsPage;
