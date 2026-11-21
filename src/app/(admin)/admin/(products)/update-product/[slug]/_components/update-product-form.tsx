/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';
import type { Resolver } from 'react-hook-form';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { EditorToolbar } from '@/components/tiptap/editor-toolbar';
import { ProductSchema } from '@/schema/product';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { PRODUCT_OFFER_TAG_LIST } from '@/constants/product-meta';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { TagsInput } from '@/components/ui/tags-input';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import { ProductShortVideosUpload } from '@/components/ui/product-short-videos-upload';
import {
    useGetSingleProductByIdForAdminViewQuery,
    useUpdateProductMutation,
    useUpdateVariantsByProductIdMutation
} from '@/redux/api-queries/product-api';
import { Loader } from 'lucide-react';
import { TProduct, TProductShortVideo } from '@/types/product';
import { useGetAllCategoriesQuery } from '@/redux/api-queries/category-api';
import {
    useGetAllSubCategoriesByCategoryIdQuery,
    useGetAllSubSubCategoriesByCategoryIdQuery
} from '@/redux/api-queries/subcategory-api';
import { TCategory } from '@/types/category';
import { TSubCategory } from '@/types/sub-category';
import { useUploadMultipleFileToAWSMutation } from '@/redux/api-queries/file-upload-api';
import { toast } from 'sonner';
import { ENV } from '@/constants/env';
import { useRouter } from 'next/navigation';
import { TAttributesAndVariantsData } from '@/components/shared/AttributesAndVariantsAddOrUpdate';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useUploadFileToAWSMutation } from '@/redux/api-queries/file-upload-api';
import { useGetActiveReturnPoliciesQuery } from '@/redux/api-queries/return-policy-api';
import { useGetAllBrandsQuery } from '@/redux/api-queries/brand-api';
import DangerZone from './DangerZone';
import AttributesAndVariantsUpdate from './AttributesAndVariantsUpdate';

const UpdateProductForm = ({ slug }: { slug: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_UPDATE
        ]
    });

    // === state for selected category ===
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(undefined);
    const [selectedSubCategory, setSelectedSubCategory] = useState<
        string | undefined
    >(undefined);

    const [defaultAttributesAndVariants, setDefaultAttributesAndVariants] =
        useState<TAttributesAndVariantsData | null>(null);
    const [rootLevelSKU, setRootLevelSKU] = useState<string>('');
    const [rawVariantsWithFiles, setRawVariantsWithFiles] = useState<any>([]);

    const [dynamicSpecs, setDynamicSpecs] = useState<
        Array<{
            title: string;
            description: string;
            options: string[];
        }>
    >([]);
    const [originalDynamicSpecs, setOriginalDynamicSpecs] = useState<
        Array<{
            title: string;
            description: string;
            options: string[];
        }>
    >([]);

    const [productSpecifications, setProductSpecifications] = useState<
        Array<{
            title: string;
            description: string[];
            imported_value?: {
                title?: string;
                min_text?: string;
                max_text?: string;
                min_value?: string;
                max_value?: string;
                current_value?: string;
            };
        }>
    >([]);
    const [originalProductSpecifications, setOriginalProductSpecifications] =
        useState<
            Array<{
                title: string;
                description: string[];
                imported_value?: {
                    title?: string;
                    min_text?: string;
                    max_text?: string;
                    min_value?: string;
                    max_value?: string;
                    current_value?: string;
                };
            }>
        >([]);

    const [productCardProperties, setProductCardProperties] = useState<
        Array<{
            title: string;
            min_text: string;
            max_text: string;
            min_value: string;
            max_value: string;
            current_value: string;
        }>
    >([]);
    const [originalProductCardProperties, setOriginalProductCardProperties] =
        useState<
            Array<{
                title: string;
                min_text: string;
                max_text: string;
                min_value: string;
                max_value: string;
                current_value: string;
            }>
        >([]);

    // === router ===
    const router = useRouter();

    // === get product data by id ===
    const { data, isLoading } = useGetSingleProductByIdForAdminViewQuery({
        product_id: slug
    });
    const product: TProduct = data?.data;

    const variantSerialize =
        product?.variants
            ?.slice() // avoid mutating original array
            .sort((a: any, b: any) => {
                const serialA = a?.serial ?? Number.MAX_SAFE_INTEGER;
                const serialB = b?.serial ?? Number.MAX_SAFE_INTEGER;
                return serialA - serialB;
            })
            .map((v: any, index: number) => ({
                ...v,
                serial: index + 1 // always 1,2,3...
            })) || [];

    // Memoize product to prevent unnecessary re-renders
    const memoizedProduct = useMemo(() => product, [product]);

    // === categories and sub categories ===
    const { data: categoriesData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categoryOptions = useMemo(
        () =>
            categoriesData?.data?.data?.map((category: TCategory) => ({
                label: category?.name_en,
                value: category?._id
            })) || [],
        [categoriesData?.data?.data]
    );

    const { data: subCategoriesData } = useGetAllSubCategoriesByCategoryIdQuery(
        {
            category_id: selectedCategory
                ? selectedCategory
                : product?.category?._id
        }
        /* {
      skip: !selectedCategory || !product?.category?._id,
    } */
    );
    const subCategoryOptions = useMemo(
        () =>
            subCategoriesData?.data?.map((subCategory: TSubCategory) => ({
                label: subCategory?.name_en,
                value: subCategory?._id
            })) || [],
        [subCategoriesData?.data]
    );

    const { data: subSubCategoriesData } =
        useGetAllSubSubCategoriesByCategoryIdQuery(
            {
                category_id: selectedSubCategory
                    ? selectedSubCategory
                    : product?.subcategory?._id
            }
            /* {
        skip: !product?.subcategory?._id || !selectedSubCategory,
      } */
        );
    const subSubCategoryOptions = useMemo(
        () =>
            subSubCategoriesData?.data?.sub_subcategories?.map(
                (subCategory: TSubCategory) => ({
                    label: subCategory?.name_en,
                    value: subCategory?._id
                })
            ) || [],
        [subSubCategoriesData?.data?.sub_subcategories]
    );

    // === return policies ===
    const { data: returnPoliciesData } = useGetActiveReturnPoliciesQuery({});
    const returnPolicyOptions = useMemo(
        () =>
            returnPoliciesData?.data?.data?.map((policy: any) => ({
                label: `${policy.title} (${policy.return_period_days} days)`,
                value: policy._id,
                description: policy?.description
            })) || [],
        [returnPoliciesData?.data?.data]
    );

    // === brands ===
    const { data: brandsData } = useGetAllBrandsQuery({});
    const brandOptions = useMemo(
        () =>
            brandsData?.data?.map((brand: any) => ({
                label: brand.name,
                value: brand._id
            })) || [],
        [brandsData?.data]
    );

    // === thumbnail and slider images state ===
    const [thumbnail, setThumbnail] = useState<File | string | undefined>(
        undefined
    );
    const [sliderImages, setSliderImages] = useState<(string | File)[]>([]);
    const [initialThumbnailUrl, setInitialThumbnailUrl] = useState<
        string | undefined
    >(undefined);

    // === short videos (story / tiktok style) state ===
    const [shortVideos, setShortVideos] = useState<TProductShortVideo[]>([]);

    // === form default values ===
    const form = useForm<z.infer<typeof ProductSchema>>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(ProductSchema) as Resolver<
            z.infer<typeof ProductSchema>
        >,
        defaultValues: {
            name: '',
            description: '',
            sale_channels: {
                pos: true,
                website: true
            },
            category: '',
            subcategory: '',
            sub_subcategory: null,
            shipping_cost: 0,
            shipping_cost_per_unit: 0,
            min_order_qty: 1,
            max_order_qty: 100,
            search_tags: [],
            offer_tags: [],
            highlight_labels: [],
            approximately_delivery_time: '3-5 days',
            is_free_delivery: false,
            warranty: '',
            return_policy: ''
        }
    });

    // Track if we've initialized the form with product data to prevent infinite loops
    const isInitialized = useRef(false);

    // === initialize tiptap editor ===
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Enter product description'
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right']
            })
        ],
        content: form.getValues('description'),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            form.setValue('description', html, { shouldValidate: true });
        }
    });

    const [preUploadedSliderUrls, setPreUploadedSliderUrls] = useState<
        string[]
    >([]);

    // === file upload api mutation hook ===
    const [uploadSingleFileToAWS, { isLoading: isUploadFileLoading }] =
        useUploadFileToAWSMutation();
    // === update product api mutation hook ===
    const [updateProduct, { isLoading: isUpdateProductLoading }] =
        useUpdateProductMutation();
    const [updateVariantsAPI, { isLoading: isUpdateVariant }] =
        useUpdateVariantsByProductIdMutation();

    const [uploadMultipleFileToAWS] = useUploadMultipleFileToAWSMutation();

    // === handle update product ===
    const handleUpdateProduct = async (data: z.infer<typeof ProductSchema>) => {
        // === payload ===
        const payload: any = { ...data, sku: rootLevelSKU };

        // Remove empty subcategory and sub_subcategory from payload
        if (!payload.subcategory || payload.subcategory === '') {
            delete payload.subcategory;
        }
        if (!payload.sub_subcategory || payload.sub_subcategory === '') {
            delete payload.sub_subcategory;
        }

        // === is new thumbnail image exist ===
        const isNewThumbnailExists =
            thumbnail &&
            typeof thumbnail !== 'string' &&
            typeof thumbnail === 'object';

        // === is thumbnail removed ===
        const isThumbnailRemoved = thumbnail === '';

        // === slider images previous and new files ===
        const sliderImagesNewFiles = sliderImages?.filter(
            (item) => typeof item === 'object'
        );
        const previousSliderImages = sliderImages?.filter(
            (item) => typeof item === 'string'
        );

        try {
            //  variants update with separate API - First upload variant files
            if (defaultAttributesAndVariants) {
                // Upload variant files if there are any
                // let processedVariants = defaultAttributesAndVariants.variants || [];
                // if (rawVariantsWithFiles && rawVariantsWithFiles.length > 0) {
                //   processedVariants = await uploadVariantFilesAndGetPayload(
                //     rawVariantsWithFiles,
                //     uploadFileToAWS,
                //   );
                // }

                const variantPayload = {
                    product_id: product?._id,
                    payload: {
                        ...defaultAttributesAndVariants,
                        variants: defaultAttributesAndVariants.variants
                    }
                };

                console.log('=== VARIANT PAYLOAD ===');
                console.log(
                    'defaultAttributesAndVariants:',
                    defaultAttributesAndVariants
                );
                console.log('rawVariantsWithFiles:', rawVariantsWithFiles);
                console.log('variantPayload:', variantPayload);
                console.log('========================');

                const variantUpdateRes: any =
                    await updateVariantsAPI(variantPayload);

                if (variantUpdateRes?.data?.success) {
                    toast.success('Variants updated successfully!');
                } else {
                    toast.error(
                        variantUpdateRes?.error?.data?.error ||
                            'Failed to variant update!'
                    );
                    return;
                }
            }

            // Upload slider images if there are new files
            let sliderImagesUrls: string[] = [];
            if (sliderImagesNewFiles && sliderImagesNewFiles.length > 0) {
                const response: any = await uploadMultipleFileToAWS(
                    sliderImagesNewFiles as File[]
                );
                if (response?.data?.success) {
                    sliderImagesUrls = response?.data?.data?.urls || [];
                } else {
                    toast.error('Failed to upload slider images.');
                    return;
                }
            }

            // Upload thumbnail if there's a new one
            let thumbnailUrl: string | undefined;
            if (isNewThumbnailExists) {
                thumbnailUrl = await handleUploadThumbnailToDb();
                if (!thumbnailUrl) {
                    return; // Error already handled in handleUploadThumbnailToDb
                }
            }

            // Add images to payload
            if (isThumbnailRemoved) {
                payload.thumbnail = '';
            } else if (thumbnailUrl) {
                payload.thumbnail = thumbnailUrl;
            }

            if (sliderImagesUrls.length > 0) {
                payload.slider_images = [
                    ...previousSliderImages,
                    ...sliderImagesUrls
                ];
            } else if (
                memoizedProduct?.slider_images &&
                memoizedProduct?.slider_images?.length > sliderImages?.length
            ) {
                // Handle removal of slider images
                payload.slider_images = sliderImages;
            }

            // Short videos (already uploaded to AWS by the component).
            // Reflects the current set (existing + new, minus removed).
            payload.short_videos = shortVideos;

            // Handle dynamic specs - only update if changed
            const hasDynamicSpecsChanged =
                JSON.stringify(dynamicSpecs) !==
                JSON.stringify(originalDynamicSpecs);

            if (hasDynamicSpecsChanged) {
                if (dynamicSpecs && dynamicSpecs.length > 0) {
                    payload.dynamic_specs = dynamicSpecs;
                } else {
                    // If empty, explicitly set to empty array to remove existing specs
                    payload.dynamic_specs = [];
                }
            }

            // Handle product specifications - only update if changed
            const hasProductSpecificationsChanged =
                JSON.stringify(productSpecifications) !==
                JSON.stringify(originalProductSpecifications);

            if (hasProductSpecificationsChanged) {
                if (productSpecifications && productSpecifications.length > 0) {
                    payload.product_specifications = productSpecifications;
                } else {
                    // If empty, explicitly set to empty array to remove existing specs
                    payload.product_specifications = [];
                }
            }

            // Handle product card properties - only update if changed
            const hasProductCardPropertiesChanged =
                JSON.stringify(productCardProperties) !==
                JSON.stringify(originalProductCardProperties);

            if (hasProductCardPropertiesChanged) {
                if (productCardProperties && productCardProperties.length > 0) {
                    payload.product_card_properties = productCardProperties;
                } else {
                    // If empty, explicitly set to empty array to remove existing properties
                    payload.product_card_properties = [];
                }
            }

            // api call
            console.log('payload:', payload);

            const updateProductRes: any = await updateProduct({
                payload,
                product_id: product?._id
            });

            // show success or error response
            if (updateProductRes?.data?.success) {
                toast.success('Product Updated!');
                router.replace('/admin/products');
                setSliderImages(memoizedProduct?.slider_images as string[]);
                setThumbnail(memoizedProduct?.thumbnail);
            } else if (updateProductRes?.error?.data?.error) {
                toast.error(
                    updateProductRes?.error?.data?.error ||
                        'Failed to update product!'
                );
            }
        } catch (error) {
            console.log('UPDATE PRODUCT ERROR: ', error);
            toast.error('Something went wrong! Try again.');
        }
    };

    // === handle upload thumbnail to the database ===
    const handleUploadThumbnailToDb = async () => {
        let thumbnailUrl;

        const response: any = await uploadSingleFileToAWS(thumbnail);
        if (response?.data?.success) {
            thumbnailUrl = response?.data?.data?.url;
        } else {
            toast.error('Failed to upload thumbnail.');
        }

        return thumbnailUrl;
    };

    useEffect(() => {
        const uploadSliderImagesInstantly = async () => {
            // filter new files (not strings) and existing string URLs
            const newFiles = sliderImages.filter(
                (item) => typeof item === 'object'
            ) as File[];
            const currentStringUrls = sliderImages.filter(
                (item) => typeof item === 'string'
            ) as string[];

            if (newFiles.length === 0) {
                // no new files to upload, just sync with current string URLs (handles removal case)
                setPreUploadedSliderUrls(currentStringUrls);
                return;
            }

            try {
                const response: any = await uploadMultipleFileToAWS(newFiles);
                if (response?.data?.success) {
                    const uploadedUrls = response?.data?.data?.urls || [];
                    // set both current string URLs and newly uploaded URLs
                    setPreUploadedSliderUrls([
                        ...currentStringUrls,
                        ...uploadedUrls
                    ]);
                } else {
                    toast.error('Failed to upload slider images.');
                }
            } catch (error) {
                console.log('INSTANT UPLOAD ERROR: ', error);
                toast.error('Something went wrong while uploading images.');
            }
        };

        uploadSliderImagesInstantly();
    }, [sliderImages]);

    // Inside your Parent Component
    const memoizedDefaultValue = useMemo(() => {
        if (
            !memoizedProduct?.variants ||
            memoizedProduct.variants[0]?.attributes?.length === 0
        ) {
            return null;
        }
        return {
            attributes: memoizedProduct.attributes || [],
            variants: memoizedProduct.variants.map((v: any) => ({
                attribute_values: v.attribute_values,
                sale_price: v.sale_price,
                regular_price: v.regular_price,
                sku: v.sku,
                barcode: v.barcode,
                discount_type: v.discount_type,
                discount_value: v.discount_value,
                color_code: v.color_code,
                images: v.images,
                videos: v.videos
            }))
        };
    }, [memoizedProduct]); // Only changes if 'product' data actually changes

    // === reset form values to get default values from backend ===
    const { reset } = form;

    // Memoize the default sale channels object to prevent infinite re-renders
    const defaultSaleChannels = useMemo(
        () => ({
            pos: true,
            website: true
        }),
        []
    );

    // Memoize empty arrays to prevent infinite re-renders
    const emptyArray = useMemo(() => [], []);

    useEffect(() => {
        if (slug && memoizedProduct && !isInitialized.current) {
            reset({
                name: memoizedProduct?.name ?? '',
                description: memoizedProduct?.description ?? '',
                sale_channels:
                    memoizedProduct?.sale_channels ?? defaultSaleChannels,
                category: memoizedProduct?.category?._id ?? '',
                subcategory: memoizedProduct?.subcategory?._id ?? '',
                sub_subcategory: memoizedProduct?.sub_subcategory ?? '',
                brand: memoizedProduct?.brand?._id ?? '',
                shipping_cost: memoizedProduct?.shipping_cost ?? 0,
                shipping_cost_per_unit:
                    memoizedProduct?.shipping_cost_per_unit ?? 0,
                min_order_qty: memoizedProduct?.min_order_qty ?? 1,
                max_order_qty: memoizedProduct?.max_order_qty ?? 100,
                search_tags: memoizedProduct?.search_tags ?? emptyArray,
                offer_tags: memoizedProduct?.offer_tags ?? emptyArray,
                highlight_labels:
                    memoizedProduct?.highlight_labels ?? emptyArray,
                approximately_delivery_time:
                    memoizedProduct?.approximately_delivery_time ?? '',
                is_free_delivery: memoizedProduct?.is_free_delivery ?? false,
                warranty: memoizedProduct?.warranty ?? '',
                return_policy: memoizedProduct?.return_policy?._id ?? ''
            });

            setRootLevelSKU(memoizedProduct?.sku ?? '');
            setThumbnail(memoizedProduct?.thumbnail);
            setSliderImages((memoizedProduct?.slider_images as string[]) || []);
            setInitialThumbnailUrl(memoizedProduct?.thumbnail);

            // Initialize dynamic specs from product data
            if (
                memoizedProduct?.dynamic_specs &&
                memoizedProduct?.dynamic_specs.length > 0
            ) {
                setDynamicSpecs(memoizedProduct.dynamic_specs);
                setOriginalDynamicSpecs(memoizedProduct.dynamic_specs);
            } else {
                setDynamicSpecs([]);
                setOriginalDynamicSpecs([]);
            }

            // Initialize product specifications from product data
            if (
                memoizedProduct?.product_specifications &&
                memoizedProduct?.product_specifications.length > 0
            ) {
                setProductSpecifications(
                    memoizedProduct.product_specifications
                );
                setOriginalProductSpecifications(
                    memoizedProduct.product_specifications
                );
            } else {
                setProductSpecifications([]);
                setOriginalProductSpecifications([]);
            }

            // Initialize product card properties from product data
            if (
                memoizedProduct?.product_card_properties &&
                memoizedProduct?.product_card_properties.length > 0
            ) {
                setProductCardProperties(
                    memoizedProduct.product_card_properties
                );
                setOriginalProductCardProperties(
                    memoizedProduct.product_card_properties
                );
            } else {
                setProductCardProperties([]);
                setOriginalProductCardProperties([]);
            }

            isInitialized.current = true;
        }
    }, [memoizedProduct, slug, defaultSaleChannels, emptyArray]);

    // Separate useEffect for editor to avoid infinite loop
    useEffect(() => {
        if (editor && memoizedProduct?.description && !editor.isFocused) {
            editor.commands.setContent(memoizedProduct?.description);
        }
    }, [memoizedProduct?.description, editor]);

    const handleUpdateVariants = async () => {
        //  variants update with separate API
        if (defaultAttributesAndVariants) {
            const variantPayload = {
                product_id: product?._id,
                payload: defaultAttributesAndVariants
            };
            // return;
            const variantUpdateRes: any =
                await updateVariantsAPI(variantPayload);
            if (variantUpdateRes?.data?.success) {
                toast.success('Variants updated successfully!');
                router.replace('/admin/products');
            } else {
                toast.error(
                    variantUpdateRes?.error?.data?.error ||
                        'Failed to variant update!'
                );
                return;
            }
        }
    };

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='space-y-6'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleUpdateProduct)}
                    className='w-full space-y-6'
                >
                    {/* name, description */}
                    <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                        {/* ===== name field ===== */}
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter product name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ===== description field ===== */}
                        <FormField
                            control={form.control}
                            name='description'
                            render={({}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <div className='space-y-2'>
                                            {editor && (
                                                <EditorToolbar
                                                    editor={editor}
                                                />
                                            )}
                                            <div className='rounded-lg border p-4'>
                                                <EditorContent
                                                    editor={editor}
                                                    className='prose max-w-none'
                                                />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ===== dynamic specs accordion ===== */}
                        <Accordion type='single' collapsible className='w-full'>
                            <AccordionItem value='dynamic-specs'>
                                <AccordionTrigger className='hover:no-underline'>
                                    Product Details Specification (Optional)
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className='space-y-4'>
                                        {dynamicSpecs.map((spec, index) => (
                                            <div
                                                key={index}
                                                className='rounded-lg border p-4'
                                            >
                                                <div className='flex items-center gap-4'>
                                                    {/* title field */}
                                                    <div className='flex-1 space-y-2'>
                                                        <label className='text-xs font-medium'>
                                                            Title
                                                        </label>
                                                        <Input
                                                            placeholder='Port types'
                                                            value={spec.title}
                                                            onChange={(e) => {
                                                                const newSpecs =
                                                                    [
                                                                        ...dynamicSpecs
                                                                    ];
                                                                newSpecs[
                                                                    index
                                                                ] = {
                                                                    ...newSpecs[
                                                                        index
                                                                    ],
                                                                    title: e
                                                                        .target
                                                                        .value
                                                                };
                                                                setDynamicSpecs(
                                                                    newSpecs
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    {/* description field */}
                                                    <div className='flex-1 space-y-2'>
                                                        <label className='text-xs font-medium'>
                                                            Description
                                                        </label>
                                                        <Input
                                                            placeholder='Description'
                                                            value={
                                                                spec.description
                                                            }
                                                            onChange={(e) => {
                                                                const newSpecs =
                                                                    [
                                                                        ...dynamicSpecs
                                                                    ];
                                                                newSpecs[
                                                                    index
                                                                ] = {
                                                                    ...newSpecs[
                                                                        index
                                                                    ],
                                                                    description:
                                                                        e.target
                                                                            .value
                                                                };
                                                                setDynamicSpecs(
                                                                    newSpecs
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    {/* options field */}
                                                    <div className='flex-1 space-y-2'>
                                                        <label className='text-xs font-medium'>
                                                            Options
                                                        </label>
                                                        <TagsInput
                                                            placeholder='Options (comma separated)'
                                                            value={spec.options}
                                                            onValueChange={(
                                                                options
                                                            ) => {
                                                                const newSpecs =
                                                                    [
                                                                        ...dynamicSpecs
                                                                    ];
                                                                newSpecs[
                                                                    index
                                                                ] = {
                                                                    ...newSpecs[
                                                                        index
                                                                    ],
                                                                    options
                                                                };
                                                                setDynamicSpecs(
                                                                    newSpecs
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    {/* remove button */}
                                                    <div className='flex items-end pb-2'>
                                                        <Button
                                                            type='button'
                                                            variant='destructive'
                                                            size='sm'
                                                            onClick={() => {
                                                                const newSpecs =
                                                                    dynamicSpecs.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    );
                                                                setDynamicSpecs(
                                                                    newSpecs
                                                                );
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* add button */}
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                setDynamicSpecs([
                                                    ...dynamicSpecs,
                                                    {
                                                        title: '',
                                                        description: '',
                                                        options: []
                                                    }
                                                ])
                                            }
                                            className='w-full'
                                        >
                                            + Add Another Spec
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* general setup */}
                    <div className='rounded-lg bg-background shadow transition-transform duration-300 hover:shadow-xl'>
                        <div className='w-full rounded-t-lg border-b px-4 py-2 text-lg font-medium lg:px-6'>
                            General Setup
                        </div>
                        <div className='grid gap-6 p-4 md:grid-cols-2 lg:p-6 xl:grid-cols-3'>
                            {/* ===== category field ===== */}
                            <FormField
                                control={form.control}
                                name='category'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSelectedCategory(value);

                                                // RESET CHILDREN
                                                form.setValue(
                                                    'subcategory',
                                                    ''
                                                );
                                                form.setValue(
                                                    'sub_subcategory',
                                                    null
                                                );
                                                setSelectedSubCategory(
                                                    undefined
                                                );
                                            }}
                                            defaultValue={
                                                product?.category?._id
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select a category' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoryOptions?.map(
                                                    (category: {
                                                        label: string;
                                                        value: string;
                                                    }) => (
                                                        <SelectItem
                                                            key={category.value}
                                                            value={
                                                                category.value
                                                            }
                                                        >
                                                            {category.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ===== sub category field ===== */}
                            <FormField
                                control={form.control}
                                name='subcategory'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub Category</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSelectedSubCategory(value);
                                                // RESET CHILD
                                                form.setValue(
                                                    'sub_subcategory',
                                                    null
                                                );
                                            }}
                                            defaultValue={
                                                product?.subcategory?._id
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select a sub category' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subCategoryOptions?.map(
                                                    (subCategory: {
                                                        label: string;
                                                        value: string;
                                                    }) => (
                                                        <SelectItem
                                                            key={
                                                                subCategory.value
                                                            }
                                                            value={
                                                                subCategory.value
                                                            }
                                                        >
                                                            {subCategory.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== sub sub category field ===== */}
                            <FormField
                                control={form.control}
                                name='sub_subcategory'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='font-semibold text-black'>
                                            Sub Sub Category (optional)
                                        </FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value)
                                            }
                                            defaultValue={
                                                product?.sub_subcategory
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select a sub-sub category' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subSubCategoryOptions.map(
                                                    (option: any) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    )
                                                )}

                                                {subSubCategoryOptions.length ===
                                                    0 && (
                                                    <div className='px-4 py-2 text-sm text-gray-500'>
                                                        No categories available
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== brand field ===== */}
                            <FormField
                                control={form.control}
                                name='brand'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='font-semibold text-black'>
                                            Brand (optional)
                                        </FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value)
                                            }
                                            defaultValue={product?.brand?._id}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select a brand' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brandOptions.map(
                                                    (option: any) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    )
                                                )}

                                                {brandOptions.length === 0 && (
                                                    <div className='px-4 py-2 text-sm text-gray-500'>
                                                        No brands available
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== offer tags ===== */}
                            <FormField
                                control={form.control}
                                name='offer_tags'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Offer Tags</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                // key={form.watch("offerTags")?.join(",")} // re-render when changes
                                                options={PRODUCT_OFFER_TAG_LIST}
                                                onValueChange={field.onChange}
                                                defaultValue={
                                                    product?.offer_tags
                                                }
                                                placeholder='Select offer tags'
                                                variant='inverted'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ===== search tags ===== */}
                            <FormField
                                control={form.control}
                                name='search_tags'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Search Tags</FormLabel>
                                        <FormControl>
                                            <TagsInput
                                                placeholder='Enter your search tags'
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== min order qty field ===== */}
                            <FormField
                                control={form.control}
                                name='min_order_qty'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Order Qty</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter minimum order quantity'
                                                type='number'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== max order qty field ===== */}
                            <FormField
                                control={form.control}
                                name='max_order_qty'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Order Qty</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter minimum order quantity'
                                                type='number'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== is free delivery field ===== */}
                            <FormField
                                control={form.control}
                                name='is_free_delivery'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='w-full'>
                                            Is Free Delivery?
                                        </FormLabel>
                                        <div className='flex h-9 items-center justify-between rounded-md border border-input px-3'>
                                            <div className='w-full space-y-0.5'>
                                                <FormLabel className='w-full text-sm text-muted-foreground'>
                                                    Wanna offer free delivery?
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* ===== delivery time field ===== */}
                            <FormField
                                control={form.control}
                                name='approximately_delivery_time'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='3-5 days'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ===== highlight_labels tags ===== */}
                            <FormField
                                control={form.control}
                                name='highlight_labels'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Highlight Labels</FormLabel>
                                        <FormControl>
                                            <TagsInput
                                                placeholder='Enter your High Lights tags'
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                maxTags={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* ===== product specifications accordion ===== */}
                        <Accordion
                            type='single'
                            collapsible
                            className='w-full border-x-0 border-t-0 pb-4'
                        >
                            <AccordionItem
                                value='product-specifications'
                                className='border-x-0 border-t-0'
                            >
                                <AccordionTrigger className='px-4 hover:no-underline lg:px-6'>
                                    Product Information (Optional)
                                </AccordionTrigger>
                                <AccordionContent className='px-4 lg:px-6'>
                                    <div className='space-y-4 pb-4'>
                                        {productSpecifications.map(
                                            (spec, index) => (
                                                <div
                                                    key={index}
                                                    className='space-y-4 rounded-lg border p-4'
                                                >
                                                    <div className='grid gap-4 md:grid-cols-2'>
                                                        {/* title field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Title
                                                            </label>
                                                            <Input
                                                                placeholder='Display'
                                                                value={
                                                                    spec.title
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newSpecs =
                                                                        [
                                                                            ...productSpecifications
                                                                        ];
                                                                    newSpecs[
                                                                        index
                                                                    ] = {
                                                                        ...newSpecs[
                                                                            index
                                                                        ],
                                                                        title: e
                                                                            .target
                                                                            .value
                                                                    };
                                                                    setProductSpecifications(
                                                                        newSpecs
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* description field - tags input */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Description
                                                            </label>
                                                            <TagsInput
                                                                placeholder='Description items'
                                                                value={
                                                                    spec.description
                                                                }
                                                                onValueChange={(
                                                                    description
                                                                ) => {
                                                                    const newSpecs =
                                                                        [
                                                                            ...productSpecifications
                                                                        ];
                                                                    newSpecs[
                                                                        index
                                                                    ] = {
                                                                        ...newSpecs[
                                                                            index
                                                                        ],
                                                                        description
                                                                    };
                                                                    setProductSpecifications(
                                                                        newSpecs
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* imported_value section */}
                                                    <div className='space-y-3'>
                                                        <div className='flex items-center gap-2'>
                                                            <label className='text-xs font-medium'>
                                                                Imported Value
                                                                (Optional)
                                                            </label>
                                                        </div>
                                                        <div className='grid gap-4 md:grid-cols-3'>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Title
                                                                </label>
                                                                <Input
                                                                    placeholder='Screen Size'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.title ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    title: e
                                                                                        .target
                                                                                        .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Min Text
                                                                </label>
                                                                <Input
                                                                    placeholder='Min'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.min_text ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    min_text:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Min Value
                                                                </label>
                                                                <Input
                                                                    placeholder='6.1'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.min_value ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    min_value:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Max Text
                                                                </label>
                                                                <Input
                                                                    placeholder='Max'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.max_text ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    max_text:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Max Value
                                                                </label>
                                                                <Input
                                                                    placeholder='6.7'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.max_value ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    max_value:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <label className='text-xs font-medium'>
                                                                    Current
                                                                    Value
                                                                </label>
                                                                <Input
                                                                    placeholder='6.67'
                                                                    value={
                                                                        spec
                                                                            .imported_value
                                                                            ?.current_value ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newSpecs =
                                                                            [
                                                                                ...productSpecifications
                                                                            ];
                                                                        newSpecs[
                                                                            index
                                                                        ] = {
                                                                            ...newSpecs[
                                                                                index
                                                                            ],
                                                                            imported_value:
                                                                                {
                                                                                    ...newSpecs[
                                                                                        index
                                                                                    ]
                                                                                        .imported_value,
                                                                                    current_value:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                }
                                                                        };
                                                                        setProductSpecifications(
                                                                            newSpecs
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* remove button */}
                                                    <div className='flex justify-end'>
                                                        <Button
                                                            type='button'
                                                            variant='destructive'
                                                            size='sm'
                                                            onClick={() => {
                                                                const newSpecs =
                                                                    productSpecifications.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    );
                                                                setProductSpecifications(
                                                                    newSpecs
                                                                );
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {/* add button */}
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                setProductSpecifications([
                                                    ...productSpecifications,
                                                    {
                                                        title: '',
                                                        description: []
                                                    }
                                                ])
                                            }
                                            className='w-full'
                                        >
                                            + Add Another Specification
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* ===== product card properties accordion ===== */}
                        <Accordion
                            type='single'
                            collapsible
                            className='w-full border-x-0 border-t-0 pb-4'
                        >
                            <AccordionItem
                                value='product-card-properties'
                                className='border-x-0 border-t-0'
                            >
                                <AccordionTrigger className='px-4 hover:no-underline lg:px-6'>
                                    Product Card Properties (Optional)
                                </AccordionTrigger>
                                <AccordionContent className='px-4 lg:px-6'>
                                    <div className='space-y-4 pb-4'>
                                        {productCardProperties.map(
                                            (property, index) => (
                                                <div
                                                    key={index}
                                                    className='space-y-4 rounded-lg border p-4'
                                                >
                                                    <div className='grid gap-4 md:grid-cols-2'>
                                                        {/* title field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Title
                                                            </label>
                                                            <Input
                                                                placeholder='Thickness'
                                                                value={
                                                                    property.title
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        title: e
                                                                            .target
                                                                            .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* min_text field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Min Text
                                                            </label>
                                                            <Input
                                                                placeholder='Left text (eg: Min)'
                                                                value={
                                                                    property.min_text
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        min_text:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* max_text field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Max Text
                                                            </label>
                                                            <Input
                                                                placeholder='Right text (eg: Max)'
                                                                value={
                                                                    property.max_text
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        max_text:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* min_value field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Min Value
                                                            </label>
                                                            <Input
                                                                placeholder='eg: 1'
                                                                value={
                                                                    property.min_value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        min_value:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* max_value field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Max Value
                                                            </label>
                                                            <Input
                                                                placeholder='eg: 7'
                                                                value={
                                                                    property.max_value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        max_value:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        {/* current_value field */}
                                                        <div className='space-y-2'>
                                                            <label className='text-xs font-medium'>
                                                                Current Value
                                                            </label>
                                                            <Input
                                                                placeholder='eg: 5'
                                                                value={
                                                                    property.current_value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newProperties =
                                                                        [
                                                                            ...productCardProperties
                                                                        ];
                                                                    newProperties[
                                                                        index
                                                                    ] = {
                                                                        ...newProperties[
                                                                            index
                                                                        ],
                                                                        current_value:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    };
                                                                    setProductCardProperties(
                                                                        newProperties
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* remove button */}
                                                    <div className='flex justify-end'>
                                                        <Button
                                                            type='button'
                                                            variant='destructive'
                                                            size='sm'
                                                            onClick={() => {
                                                                const newProperties =
                                                                    productCardProperties.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    );
                                                                setProductCardProperties(
                                                                    newProperties
                                                                );
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {/* add button */}
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                setProductCardProperties([
                                                    ...productCardProperties,
                                                    {
                                                        title: '',
                                                        min_text: '',
                                                        max_text: '',
                                                        min_value: '',
                                                        max_value: '',
                                                        current_value: ''
                                                    }
                                                ])
                                            }
                                            className='w-full'
                                        >
                                            + Add Another Property
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* sale channels */}
                    <div className='rounded-lg bg-background shadow transition-transform duration-300 hover:shadow-xl'>
                        <div className='w-full rounded-t-lg border-b px-4 py-2 text-lg font-medium lg:px-6'>
                            Sale Channels
                        </div>
                        <div className='grid gap-6 p-4 lg:p-6 xl:grid-cols-2'>
                            {/* ===== POS ===== */}
                            <FormField
                                control={form.control}
                                name='sale_channels.pos'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='w-full'>
                                            POS
                                        </FormLabel>
                                        <div className='flex h-9 items-center justify-between rounded-md border border-input px-3'>
                                            <div className='w-full space-y-0.5'>
                                                <FormLabel className='w-full text-sm text-muted-foreground'>
                                                    Is available on POS?
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {/* ===== website ===== */}
                            <FormField
                                control={form.control}
                                name='sale_channels.website'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='w-full'>
                                            Website
                                        </FormLabel>
                                        <div className='flex h-9 items-center justify-between rounded-md border border-input px-3'>
                                            <div className='w-full space-y-0.5'>
                                                <FormLabel className='w-full text-sm text-muted-foreground'>
                                                    Is available on website?
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* others - warranty and return policy */}
                    <div className='rounded-lg bg-background shadow transition-transform duration-300 hover:shadow-xl'>
                        <div className='w-full rounded-t-lg border-b px-4 py-2 text-lg font-medium lg:px-6'>
                            Warranty & Return Policy (Optional)
                        </div>
                        <div className='grid gap-6 p-4 lg:p-6 xl:grid-cols-2'>
                            {/* ===== warranty ===== */}
                            <FormField
                                control={form.control}
                                name='warranty'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warranty</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='Enter warranty details'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* ===== return policy ===== */}
                            <FormField
                                control={form.control}
                                name='return_policy'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Return Policy</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select return policy' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {returnPolicyOptions?.map(
                                                    (option: any) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            <div className='max-w-[600px] space-y-0.5'>
                                                                <p>
                                                                    {
                                                                        option.label
                                                                    }
                                                                </p>
                                                                <p className='line-clamp-2 text-xs text-muted-foreground'>
                                                                    {
                                                                        option.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* thumbnail and slider images */}
                    <div className='rounded-lg bg-background shadow transition-transform duration-300 hover:shadow-xl'>
                        <div className='w-full rounded-t-lg border-b px-4 py-2 text-lg font-medium lg:px-6'>
                            Thumbnail & Slider Images
                        </div>
                        <div className='grid gap-6 p-4 lg:p-6 xl:grid-cols-2'>
                            {/* ===== thumbnail ===== */}
                            <div className='grid gap-2'>
                                <h3 className='text-sm font-medium'>
                                    Thumbnail
                                </h3>
                                <ImageUploadInput
                                    mode='single'
                                    inputId='thumbnail-image-upload'
                                    onChange={(images) => {
                                        // Handle empty array (when image is removed)
                                        if (images.length === 0) {
                                            setThumbnail('');
                                        } else {
                                            setThumbnail(images[0]);
                                        }
                                    }}
                                    defaultValue={
                                        initialThumbnailUrl
                                            ? [initialThumbnailUrl]
                                            : []
                                    }
                                />
                            </div>
                            {/* ===== slider images ===== */}
                            <div className='grid gap-2'>
                                <h3 className='text-sm font-medium'>
                                    Slider Images
                                </h3>
                                <ImageUploadInput
                                    mode='multiple'
                                    inputId='slider-image-upload'
                                    onChange={setSliderImages}
                                    defaultValue={
                                        memoizedProduct?.slider_images
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* short videos (story / tiktok style) */}
                    <div className='rounded-lg bg-background shadow transition-transform duration-300 hover:shadow-xl'>
                        <div className='w-full rounded-t-lg border-b px-4 py-2 text-lg font-medium lg:px-6'>
                            Short Videos (Story / Reels){' '}
                            <span className='text-sm font-normal text-muted-foreground'>
                                (Optional)
                            </span>
                        </div>
                        <div className='p-4 lg:p-6'>
                            <ProductShortVideosUpload
                                inputId='product-short-videos-upload'
                                onChange={setShortVideos}
                                defaultValue={memoizedProduct?.short_videos}
                            />
                        </div>
                    </div>

                    {/* submit button */}
                    <div className='mx-auto w-fit'>
                        <Button
                            type='submit'
                            disabled={
                                isUploadFileLoading ||
                                isUpdateProductLoading ||
                                isUpdateVariant
                            }
                            className='bg-green-600 hover:bg-green-700 md:px-6 md:py-5 md:text-base'
                        >
                            Update Product
                            {(isUpdateProductLoading || isUpdateVariant) && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
            <div className='space-y-4'>
                <AttributesAndVariantsUpdate
                    onChange={setDefaultAttributesAndVariants}
                    defaultRegularPrice={
                        variantSerialize?.[0]?.regular_price || 0
                    }
                    defaultSalePrice={variantSerialize?.[0]?.sale_price || 0}
                    rootLevelSKU={rootLevelSKU?.trim()}
                    defaultValue={
                        variantSerialize?.[0]?.attributes &&
                        variantSerialize?.[0]?.attributes?.length > 0
                            ? {
                                  attributes:
                                      variantSerialize?.[0]?.attributes || [],
                                  variants: variantSerialize || []
                              }
                            : null
                    }
                    setRootLevelSKU={setRootLevelSKU}
                    sliderImages={preUploadedSliderUrls}
                />
                {/* submit button */}
                <div className='mx-auto w-fit'>
                    <Button
                        type='button'
                        onClick={handleUpdateVariants}
                        className='bg-blue-600 hover:bg-blue-700 md:px-6 md:py-5 md:text-base'
                        disabled={
                            isUploadFileLoading ||
                            isUpdateProductLoading ||
                            isUpdateVariant
                        }
                    >
                        Update Variants
                        {isUpdateVariant && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </div>
            </div>
            <DangerZone productId={product?._id} variants={product?.variants} />
        </div>
    );
};

export default UpdateProductForm;
