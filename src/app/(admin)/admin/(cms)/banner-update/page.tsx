'use client';

import {
    useCreateBannerMutation,
    useCreateFeaturedProductsMutation,
    useCreateMobileBannerMutation,
    useGetAllBannersQuery
} from '@/admin/redux/api-queries/banner-api';
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Loader, X } from 'lucide-react';
import { ImageUploadInput } from '@/admin/components/ui/image-upload-input';
import { Button } from '@/admin/components/ui/button';
import { toast } from 'sonner';
import { useUploadFileToAWSMutation } from '@/admin/redux/api-queries/file-upload-api';
import { useGetAllProductsQuery } from '@/admin/redux/api-queries/product-api';
import { TProduct } from '@/admin/types/product';

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
import Image from 'next/image';
import BannerCard from './_components/banner-card';
import { TBanner } from '@/admin/types/banner';
import { Badge } from '@/admin/components/ui/badge';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { getImgFullUrl } from '@/admin/lib/utils';

const BannerUpdatePage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.CMS_VIEW,
            PermissionEnum.CMS_CREATE,
            PermissionEnum.CMS_DELETE,
            PermissionEnum.CMS_DELETE
        ]
    });

    // === banner image state ===
    const [newBanner, setNewBanner] = useState<File | string | undefined>('');
    const [newMobileBanner, setNewMobileBanner] = useState<
        File | string | undefined
    >('');
    // NEW: Featured Banner State
    const [newFeaturedBanner, setNewFeaturedBanner] = useState<
        File | string | undefined
    >('');

    console.log('newFeaturedBanner', newFeaturedBanner);
    // Changed selectedProduct to an array for multiple selections
    const [selectedProducts, setSelectedProducts] = useState<
        {
            _id: string;
            name: string;
            thumbnail: string;
        }[]
    >([]);
    // === popover state ===
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPopoverOpenForMobile, setIsPopoverOpenForMobile] = useState(false);
    // NEW: Popover state for Featured
    const [isPopoverOpenForFeatured, setIsPopoverOpenForFeatured] =
        useState(false);

    console.log('newMobileBanner', newMobileBanner);

    // === get all banners ===
    const {
        data: bannersData,
        isLoading: isBannersLoading,
        isFetching: isBannersFetching
    } = useGetAllBannersQuery({});
    const banners = bannersData?.data?.banners;
    const mobile_banners = bannersData?.data?.mobile_banners;
    // NEW: Featured banners from your JSON structure
    const featured_products = bannersData?.data?.featured_products;

    // === get all products api queries ===
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery);
    // === get all products ===
    const {
        data: productsData,
        isLoading: isGetProductsLoading,
        isFetching: isGetProductsFetching
    } = useGetAllProductsQuery(
        {
            page: 1,
            limit: 20,
            searchQuery: debouncedSearch,
            sku: ''
        },
        { refetchOnMountOrArgChange: true }
    );
    const products = productsData?.data?.data;
    const formatedProducts = products?.map((pd: TProduct) => ({
        _id: pd?._id,
        name: pd?.name,
        thumbnail: pd?.thumbnail
    }));

    // === file upload api mutations ===
    const [uploadFile, { isLoading: isFileUploadLoading }] =
        useUploadFileToAWSMutation();

    // === add new banner api mutation ===
    const [addNewBanner, { isLoading: isAddNewBannerLoading }] =
        useCreateBannerMutation();
    const [addNewMobileBanner, { isLoading: isAddNewMobileBannerLoading }] =
        useCreateMobileBannerMutation();
    // NEW: Featured mutation
    const [addNewFeaturedBanner, { isLoading: isFeaturedLoading }] =
        useCreateFeaturedProductsMutation();

    // === handle adding/removing products from selection ===
    const handleSelectProduct = (product: {
        _id: string;
        name: string;
        thumbnail: string;
    }) => {
        setSelectedProducts((prevSelected) => {
            // Check if product is already selected
            const isAlreadySelected = prevSelected?.some(
                (p) => p?._id === product?._id
            );
            if (isAlreadySelected) {
                // Remove if already selected
                return prevSelected?.filter((p) => p?._id !== product?._id);
            } else {
                // Add if not selected
                return [...prevSelected, product];
            }
        });
        setSearchQuery(''); // Clear search after selection
    };

    // === handle removing a selected product from the badge list ===
    const handleRemoveSelectedProduct = (productId: string) => {
        setSelectedProducts((prevSelected) =>
            prevSelected?.filter((p) => p?._id !== productId)
        );
    };

    // === handle add new banner ===
    const handleAddNewBanner = async () => {
        // newBanner image blob
        const newBannerFormData = new FormData();
        newBannerFormData.append('file', newBanner as Blob);

        try {
            const bannerUploadResponse = await uploadFile({
                file: newBannerFormData
            });
            if (bannerUploadResponse?.data?.success) {
                const banner_url = bannerUploadResponse?.data?.data?.url;

                // make payload - send an array of product IDs
                const payload = {
                    banner_url: banner_url,
                    products_id: selectedProducts?.map((p) => p?._id)
                };
                // add new banner api call
                const addNewBannerResponse: any = await addNewBanner({
                    payload
                });
                console.log('addNewBannerResponse: ', addNewBannerResponse);
                if (addNewBannerResponse?.data?.success) {
                    toast.success('New Banner Added!');
                    setNewBanner(''); // Clear banner image
                    setSelectedProducts([]); // Clear selected products
                } else if (addNewBannerResponse?.error?.data?.message) {
                    toast.error(
                        addNewBannerResponse?.error?.data?.message ||
                            'Failed to add new banner!'
                    );
                }
            } else {
                toast.error('Failed to upload banner!');
            }
        } catch (error) {
            console.log('ADD NEW BANNER ERROR: ', error);
            toast.error('Something went wrong! Try again.');
        }
    };

    const handleAddNewMobileBanner = async () => {
        // newBanner image blob
        const newBannerFormData = new FormData();
        newBannerFormData.append('file', newMobileBanner as Blob);

        try {
            const bannerUploadResponse = await uploadFile({
                file: newBannerFormData
            });
            if (bannerUploadResponse?.data?.success) {
                const banner_url = bannerUploadResponse?.data?.data?.url;

                // make payload - send an array of product IDs
                const payload = {
                    banner_url: banner_url,
                    products_id: selectedProducts?.map((p) => p?._id)
                };
                // add new banner api call
                const addNewBannerResponse: any = await addNewMobileBanner({
                    payload
                });
                if (addNewBannerResponse?.data?.success) {
                    toast.success('New Banner Added!');
                    setNewBanner(undefined); // Clear banner image
                    setSelectedProducts([]); // Clear selected products
                } else if (addNewBannerResponse?.error?.data?.message) {
                    toast.error(
                        addNewBannerResponse?.error?.data?.message ||
                            'Failed to add new banner!'
                    );
                }
            } else {
                toast.error('Failed to upload banner!');
            }
        } catch (error) {
            console.log('ADD NEW BANNER ERROR: ', error);
            toast.error('Something went wrong! Try again.');
        }
    };

    const handleAddNewFeaturedBanner = async () => {
        // newBanner image blob
        const newBannerFormData = new FormData();
        newBannerFormData.append('file', newFeaturedBanner as Blob);

        try {
            const bannerUploadResponse = await uploadFile({
                file: newBannerFormData
            });
            if (bannerUploadResponse?.data?.success) {
                const banner_url = bannerUploadResponse?.data?.data?.url;

                // make payload - send an array of product IDs
                const payload = {
                    banner_url: banner_url,
                    products_id: selectedProducts?.map((p) => p?._id)
                };
                // add new banner api call
                const addNewBannerResponse: any = await addNewFeaturedBanner({
                    payload
                });
                if (addNewBannerResponse?.data?.success) {
                    toast.success('New Banner Added!');
                    setNewBanner(undefined); // Clear banner image
                    setSelectedProducts([]); // Clear selected products
                } else if (addNewBannerResponse?.error?.data?.message) {
                    toast.error(
                        addNewBannerResponse?.error?.data?.message ||
                            'Failed to add new banner!'
                    );
                }
            } else {
                toast.error('Failed to upload banner!');
            }
        } catch (error) {
            console.log('ADD NEW BANNER ERROR: ', error);
            toast.error('Something went wrong! Try again.');
        }
    };

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-6'>
                <h1 className='text-2xl font-medium'>Desktop Banners</h1>
            </div>
            <div className='space-y-2'>
                {/* desktop banners */}
                <div className='rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {banners?.map((banner: TBanner) => (
                            <BannerCard
                                key={banner?._id}
                                banner={banner}
                                type='DESKTOP'
                            />
                        ))}
                    </div>

                    {/* loading data state */}
                    {(isBannersLoading || isBannersFetching) && (
                        <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {Array.from({ length: 1 }).map((_, index) => (
                                <span
                                    key={index}
                                    className='animate-skeleton h-[200px] rounded-md bg-secondary'
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className='grid max-w-md gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <ImageUploadInput
                        mode='single'
                        inputId='thumbnail-image-upload'
                        // defaultValue={[]}
                        onChange={(images) => {
                            setNewBanner(images[0]);
                        }}
                    />

                    {/* Display selected products as badges */}
                    {selectedProducts?.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {selectedProducts.map((product) => (
                                <Badge
                                    key={product?._id}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                >
                                    <Image
                                        src={getImgFullUrl(product?.thumbnail)}
                                        alt={product?.name}
                                        height={20}
                                        width={20}
                                        className='rounded object-cover'
                                    />
                                    <p className='truncate'>{product?.name}</p>
                                    <div
                                        className='z-20 ml-1 size-3 cursor-pointer'
                                        onClick={() =>
                                            handleRemoveSelectedProduct(
                                                product?._id
                                            )
                                        }
                                    >
                                        <X className='size-3' />
                                    </div>
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={isPopoverOpen}
                                className='w-full justify-between truncate'
                            >
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} product(s) selected`
                                    : 'Select products...'}
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
                                        {formatedProducts?.map(
                                            (product: Partial<TProduct>) => (
                                                <CommandItem
                                                    key={product?._id}
                                                    value={product?.name}
                                                    onSelect={() =>
                                                        handleSelectProduct({
                                                            _id: product?._id as string,
                                                            name: product?.name as string,
                                                            thumbnail:
                                                                product?.thumbnail as string
                                                        })
                                                    }
                                                >
                                                    <Image
                                                        src={getImgFullUrl(
                                                            product?.thumbnail as string
                                                        )}
                                                        alt={
                                                            product?.name as string
                                                        }
                                                        height={320}
                                                        width={320}
                                                        className='size-10 rounded-md object-cover'
                                                    />
                                                    {product?.name}
                                                    <Check
                                                        className={cn(
                                                            'ml-auto h-4 w-4',
                                                            selectedProducts?.some(
                                                                (p) =>
                                                                    p._id ===
                                                                    product?._id
                                                            )
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                </CommandItem>
                                            )
                                        )}

                                        {(isGetProductsLoading ||
                                            isGetProductsFetching) && (
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

                    <div className='ms-auto w-fit'>
                        <Button
                            onClick={handleAddNewBanner}
                            disabled={
                                !newBanner ||
                                isFileUploadLoading ||
                                isAddNewBannerLoading
                            }
                        >
                            Add New Banner
                            {(isFileUploadLoading || isAddNewBannerLoading) && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* mobile banners */}
            <div className='mt-5 flex items-center justify-between gap-6'>
                <h1 className='text-2xl font-medium'>Featured Banners</h1>
            </div>
            <div className='space-y-2'>
                {/* desktop banners */}
                <div className='rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {mobile_banners?.map((banner: TBanner) => (
                            <BannerCard
                                key={banner?._id}
                                banner={banner}
                                type='MOBILE'
                            />
                        ))}
                    </div>

                    {/* loading data state */}
                    {(isBannersLoading || isBannersFetching) && (
                        <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {Array.from({ length: 1 }).map((_, index) => (
                                <span
                                    key={index}
                                    className='animate-skeleton h-[200px] rounded-md bg-secondary'
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className='grid max-w-md gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <ImageUploadInput
                        mode='single'
                        inputId='thumbnail-image-upload-1'
                        onChange={(images) => {
                            setNewMobileBanner(images[0]);
                        }}
                    />

                    {/* Display selected products as badges */}
                    {selectedProducts?.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {selectedProducts.map((product) => (
                                <Badge
                                    key={product?._id}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                >
                                    <Image
                                        src={getImgFullUrl(product?.thumbnail)}
                                        alt={product?.name}
                                        height={20}
                                        width={20}
                                        className='rounded object-cover'
                                    />
                                    <p className='truncate'>{product?.name}</p>
                                    <div
                                        className='z-20 ml-1 size-3 cursor-pointer'
                                        onClick={() =>
                                            handleRemoveSelectedProduct(
                                                product?._id
                                            )
                                        }
                                    >
                                        <X className='size-3' />
                                    </div>
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Popover
                        open={isPopoverOpenForMobile}
                        onOpenChange={setIsPopoverOpenForMobile}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={isPopoverOpenForMobile}
                                className='w-full justify-between truncate'
                            >
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} product(s) selected`
                                    : 'Select products...'}
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
                                        {formatedProducts?.map(
                                            (product: Partial<TProduct>) => (
                                                <CommandItem
                                                    key={product?._id}
                                                    value={product?.name}
                                                    onSelect={() =>
                                                        handleSelectProduct({
                                                            _id: product?._id as string,
                                                            name: product?.name as string,
                                                            thumbnail:
                                                                product?.thumbnail as string
                                                        })
                                                    }
                                                >
                                                    <Image
                                                        src={getImgFullUrl(
                                                            product?.thumbnail as string
                                                        )}
                                                        alt={
                                                            product?.name as string
                                                        }
                                                        height={320}
                                                        width={320}
                                                        className='size-10 rounded-md object-cover'
                                                    />
                                                    {product?.name}
                                                    <Check
                                                        className={cn(
                                                            'ml-auto h-4 w-4',
                                                            selectedProducts?.some(
                                                                (p) =>
                                                                    p._id ===
                                                                    product?._id
                                                            )
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                </CommandItem>
                                            )
                                        )}

                                        {(isGetProductsLoading ||
                                            isGetProductsFetching) && (
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

                    <div className='ms-auto w-fit'>
                        <Button
                            onClick={handleAddNewMobileBanner}
                            disabled={
                                !newMobileBanner ||
                                isFileUploadLoading ||
                                isAddNewMobileBannerLoading ||
                                mobile_banners?.length === 2
                            }
                        >
                            Add Featured Banner
                            {(isFileUploadLoading ||
                                isAddNewMobileBannerLoading) && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. FEATURED PRODUCTS SECTION (NEW) */}
            <div className='mt-5 flex items-center justify-between gap-6'>
                <h1 className='text-2xl font-medium'>Mobile Banners</h1>
            </div>
            <div className='space-y-2'>
                <div className='rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {featured_products?.map((banner: TBanner) => (
                            <BannerCard
                                key={banner?._id}
                                banner={banner}
                                type='FEATURED'
                            />
                        ))}
                    </div>
                </div>

                <div className='grid max-w-md gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <ImageUploadInput
                        mode='single'
                        inputId='featured-image-upload'
                        onChange={(images) => setNewFeaturedBanner(images[0])}
                    />

                    {/* Reuse your existing product selection UI logic */}
                    {selectedProducts?.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {selectedProducts.map((product) => (
                                <Badge
                                    key={product?._id}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                >
                                    <Image
                                        src={getImgFullUrl(product?.thumbnail)}
                                        alt=''
                                        height={20}
                                        width={20}
                                        className='rounded object-cover'
                                    />
                                    <p className='truncate'>{product?.name}</p>
                                    <X
                                        className='size-3 cursor-pointer'
                                        onClick={() =>
                                            handleRemoveSelectedProduct(
                                                product?._id
                                            )
                                        }
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Popover
                        open={isPopoverOpenForFeatured}
                        onOpenChange={setIsPopoverOpenForFeatured}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className='w-full justify-between'
                            >
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} selected`
                                    : 'Select products...'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0 sm:w-96'>
                            <Command>
                                <div className='p-2'>
                                    <Input
                                        placeholder='Search...'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <CommandList>
                                    <CommandGroup>
                                        {formatedProducts?.map(
                                            (product: any) => (
                                                <CommandItem
                                                    key={product?._id}
                                                    onSelect={() =>
                                                        handleSelectProduct(
                                                            product
                                                        )
                                                    }
                                                >
                                                    <Image
                                                        src={getImgFullUrl(
                                                            product.thumbnail
                                                        )}
                                                        alt=''
                                                        height={40}
                                                        width={40}
                                                        className='mr-2 size-10 rounded-md object-cover'
                                                    />
                                                    {product.name}
                                                    <Check
                                                        className={cn(
                                                            'ml-auto h-4 w-4',
                                                            selectedProducts.some(
                                                                (p) =>
                                                                    p._id ===
                                                                    product._id
                                                            )
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                </CommandItem>
                                            )
                                        )}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <div className='ms-auto w-fit'>
                        <Button
                            onClick={handleAddNewFeaturedBanner}
                            disabled={
                                !newFeaturedBanner ||
                                isFileUploadLoading ||
                                isFeaturedLoading
                            }
                        >
                            Add Mobile Banner
                            {(isFileUploadLoading || isFeaturedLoading) && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. FEATURED PRODUCTS SECTION (NEW) */}
            <div className='mt-5 flex items-center justify-between gap-6'>
                <h1 className='text-2xl font-medium'>Mobile Banners</h1>
            </div>
            <div className='space-y-2'>
                <div className='rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {featured_products?.map((banner: TBanner) => (
                            <BannerCard
                                key={banner?._id}
                                banner={banner}
                                type='FEATURED'
                            />
                        ))}
                    </div>
                </div>

                <div className='grid max-w-md gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <ImageUploadInput
                        mode='single'
                        inputId='featured-image-upload'
                        onChange={(images) => setNewFeaturedBanner(images[0])}
                    />

                    {/* Reuse your existing product selection UI logic */}
                    {selectedProducts?.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {selectedProducts.map((product) => (
                                <Badge
                                    key={product?._id}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                >
                                    <Image
                                        src={getImgFullUrl(product?.thumbnail)}
                                        alt=''
                                        height={20}
                                        width={20}
                                        className='rounded object-cover'
                                    />
                                    <p className='truncate'>{product?.name}</p>
                                    <X
                                        className='size-3 cursor-pointer'
                                        onClick={() =>
                                            handleRemoveSelectedProduct(
                                                product?._id
                                            )
                                        }
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Popover
                        open={isPopoverOpenForFeatured}
                        onOpenChange={setIsPopoverOpenForFeatured}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className='w-full justify-between'
                            >
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} selected`
                                    : 'Select products...'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0 sm:w-96'>
                            <Command>
                                <div className='p-2'>
                                    <Input
                                        placeholder='Search...'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <CommandList>
                                    <CommandGroup>
                                        {formatedProducts?.map(
                                            (product: any) => (
                                                <CommandItem
                                                    key={product?._id}
                                                    onSelect={() =>
                                                        handleSelectProduct(
                                                            product
                                                        )
                                                    }
                                                >
                                                    <Image
                                                        src={getImgFullUrl(
                                                            product.thumbnail
                                                        )}
                                                        alt=''
                                                        height={40}
                                                        width={40}
                                                        className='mr-2 size-10 rounded-md object-cover'
                                                    />
                                                    {product.name}
                                                    <Check
                                                        className={cn(
                                                            'ml-auto h-4 w-4',
                                                            selectedProducts.some(
                                                                (p) =>
                                                                    p._id ===
                                                                    product._id
                                                            )
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                </CommandItem>
                                            )
                                        )}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <div className='ms-auto w-fit'>
                        <Button
                            onClick={handleAddNewFeaturedBanner}
                            disabled={
                                !newFeaturedBanner ||
                                isFileUploadLoading ||
                                isFeaturedLoading
                            }
                        >
                            Add Mobile Banner
                            {(isFileUploadLoading || isFeaturedLoading) && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerUpdatePage;
