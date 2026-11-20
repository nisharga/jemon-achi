'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Loader } from 'lucide-react';
import { Button } from '@/admin/components/ui/button';
import { toast } from 'sonner';
import { useGetAllSearchVariantsQuery } from '@/admin/redux/api-queries/product-api';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from '@/admin/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/admin/components/ui/popover';
import { cn } from '@/admin/lib/utils';
import { Input } from '@/admin/components/ui/input';
import useDebounce from '@/admin/hooks/use-debounce';
import { useCreateFeaturedProductMutation } from '@/admin/redux/api-queries/featured-product-api';

const AddNewFeaturedProduct = ({
    featuredProductslength
}: {
    featuredProductslength: number;
}) => {
    // === selected product state ===
    const [selectedProduct, setSelectedProduct] = useState<any>({});
    // === popover state ===
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // === get all products api queries ===
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery);
    // === get all search variants ===
    const { data: searchVariantsData, isLoading: isSearchProductLoading } =
        useGetAllSearchVariantsQuery({
            page: 1,
            limit: 20,
            searchQuery: debouncedSearch,
            barcode: '',
            product_id: ''
        });
    const searchVariants = searchVariantsData?.data?.data;
    // Group by product.sku (root SKU)
    const groupedVariants =
        searchVariants?.reduce((acc: any, item: any) => {
            const rootSKU = item?.product?.sku;
            if (!acc[rootSKU]) {
                acc[rootSKU] = {
                    productName: item?.product?.name,
                    rootSKU,
                    variants: []
                };
            }
            acc[rootSKU].variants.push(item);
            return acc;
        }, {}) || {};
    const groupedSearchResults = Object.values(groupedVariants);

    // === add new featured product api mutation hook ===
    const [
        addNewFeaturedProduct,
        { isLoading: isAddNewFeaturedProductLoading }
    ] = useCreateFeaturedProductMutation();

    // === handle add new featured product ===
    const handleAddNewFeaturedProduct = async () => {
        if (featuredProductslength >= 3) {
            toast.error('You can only marked 3 products as featured products!');
            setSelectedProduct({});
            return;
        }

        // make payload
        const payload = {
            product_id: selectedProduct?.product_id,
            variant_id: selectedProduct?.variant_id
        };

        try {
            const res: any = await addNewFeaturedProduct({ payload });
            if (res?.data?.success) {
                toast.success('New featured product added!');
                setSelectedProduct({});
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to add new featured product!'
                );
            }
        } catch (error: any) {
            console.log('ADD NEW FEATURED PRODUCT ERROR:', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else toast.error('Somthing went wrong!');
        }
    };
    return (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            <div className='grid gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                <div className='space-y-2'>
                    <p className='text-sm font-medium'>
                        Add New Featured Product
                    </p>
                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={isPopoverOpen}
                                className='h-auto w-full max-w-full justify-between overflow-hidden'
                            >
                                {selectedProduct?.productName ? (
                                    <div className='flex items-center gap-4 text-start text-wrap'>
                                        {selectedProduct?.productName} -{' '}
                                        {selectedProduct?.rootSKU}
                                    </div>
                                ) : (
                                    'Select product...'
                                )}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0 sm:w-96'>
                            <Command>
                                <div className='p-2'>
                                    <Input
                                        placeholder='Search product...'
                                        className='h-9'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e?.target?.value)
                                        }
                                    />
                                </div>
                                <CommandList>
                                    <CommandEmpty>
                                        No product found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {groupedSearchResults?.map(
                                            (group: any) => (
                                                <div
                                                    key={group.rootSKU}
                                                    className='w-full'
                                                >
                                                    {/* Root Product Name */}
                                                    <div className='px-2 py-1 text-sm font-medium text-muted-foreground'>
                                                        {group.productName} (
                                                        {group.rootSKU})
                                                    </div>

                                                    {/* Variants */}
                                                    {group.variants.map(
                                                        (variant: any) => {
                                                            const variantName =
                                                                Object.entries(
                                                                    variant?.attribute_values ||
                                                                        {}
                                                                )
                                                                    ?.map(
                                                                        ([
                                                                            ,
                                                                            value
                                                                        ]) =>
                                                                            value
                                                                    )
                                                                    .join(
                                                                        ' - '
                                                                    );

                                                            return (
                                                                <CommandItem
                                                                    key={
                                                                        variant?._id
                                                                    }
                                                                    value={
                                                                        variant?.sku
                                                                    }
                                                                    onSelect={() => {
                                                                        setSelectedProduct(
                                                                            {
                                                                                product_id:
                                                                                    variant
                                                                                        ?.product
                                                                                        ?._id,
                                                                                variant_id:
                                                                                    variant?._id,
                                                                                productName:
                                                                                    group.productName,
                                                                                rootSKU:
                                                                                    group.rootSKU,
                                                                                variantName,
                                                                                sku: variant?.sku
                                                                            }
                                                                        );
                                                                        setIsPopoverOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                    className='flex items-center justify-between'
                                                                >
                                                                    <span>
                                                                        {
                                                                            group.productName
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            variantName
                                                                        }
                                                                        ) -{' '}
                                                                        {
                                                                            variant?.sku
                                                                        }
                                                                    </span>
                                                                    <Check
                                                                        className={cn(
                                                                            'ml-auto h-4 w-4',
                                                                            selectedProduct?.variant_id ===
                                                                                variant?._id
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )
                                        )}

                                        {isSearchProductLoading && (
                                            <div className='mx-auto w-fit py-2'>
                                                <Loader
                                                    size={16}
                                                    className='animate-spin'
                                                />
                                            </div>
                                        )}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className='ms-auto w-fit'>
                    <Button
                        onClick={handleAddNewFeaturedProduct}
                        disabled={
                            selectedProduct?.productName === '' ||
                            isAddNewFeaturedProductLoading
                        }
                    >
                        Make Featured Product
                        {isAddNewFeaturedProductLoading && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddNewFeaturedProduct;
