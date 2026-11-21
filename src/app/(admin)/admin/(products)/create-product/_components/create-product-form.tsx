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
import { useEffect, useState } from 'react';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import { ProductShortVideosUpload } from '@/components/ui/product-short-videos-upload';
import { TProductShortVideo } from '@/types/product';
import { Loader } from 'lucide-react';
import { useGetAllCategoriesQuery } from '@/redux/api-queries/category-api';
import { TCategory } from '@/types/category';
import {
    useGetAllSubCategoriesByCategoryIdQuery,
    useGetAllSubSubCategoriesByCategoryIdQuery
} from '@/redux/api-queries/subcategory-api';
import { TSubCategory } from '@/types/sub-category';
import {
    useUploadFileToAWSMutation,
    useUploadMultipleFileToAWSMutation
} from '@/redux/api-queries/file-upload-api';
import { useCreateProductMutation } from '@/redux/api-queries/product-api';
import { useGetActiveReturnPoliciesQuery } from '@/redux/api-queries/return-policy-api';
import { useGetAllBrandsQuery } from '@/redux/api-queries/brand-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import AttributesAndVariantsAddOrUpdate, {
    TAttributesAndVariantsData
} from '@/components/shared/AttributesAndVariantsAddOrUpdate';

const CreateProductForm = () => {
    // === state for selected category ===
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(undefined);

    const [loading, setLoading] = useState(false);

    const [selectedSubCategory, setSelectedSubCategory] = useState<
        string | undefined
    >(undefined);

    const [actionType, setActionType] = useState<
        'SAVE' | 'SAVE_AND_ADD' | 'SAVE_AND_OPEN_STOCK'
    >();

    const [newAttributesAndVariants, setNewAttributesAndVariants] =
        useState<TAttributesAndVariantsData | null>(null);
    const [rootLevelSKU, setRootLevelSKU] = useState<string>('');

    const [preUploadedSliderUrls, setPreUploadedSliderUrls] = useState<
        string[]
    >([]);

    const [dynamicSpecs, setDynamicSpecs] = useState<
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

    // === categories and sub categories ===
    const { data: categoriesData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categoryOptions =
        categoriesData?.data?.data?.map((category: TCategory) => ({
            label: category?.name_en,
            value: category?._id
        })) || [];

    // === return policies ===
    const { data: returnPoliciesData } = useGetActiveReturnPoliciesQuery({});
    const returnPolicyOptions =
        returnPoliciesData?.data?.data?.map((policy: any) => ({
            label: `${policy.title} (${policy.return_period_days} days)`,
            value: policy._id,
            description: policy?.description
        })) || [];

    // === brands ===
    const { data: brandsData } = useGetAllBrandsQuery({});
    const brandOptions =
        brandsData?.data?.map((brand: any) => ({
            label: brand.name,
            value: brand._id
        })) || [];

    const { data: subCategoriesData } = useGetAllSubCategoriesByCategoryIdQuery(
        { category_id: selectedCategory },
        {
            skip: !selectedCategory
        }
    );
    const subCategoryOptions =
        subCategoriesData?.data?.map((subCategory: TSubCategory) => ({
            label: subCategory?.name_en,
            value: subCategory?._id
        })) || [];

    const { data: subSubCategoriesData } =
        useGetAllSubSubCategoriesByCategoryIdQuery(
            { category_id: selectedSubCategory },
            {
                skip: !selectedSubCategory
            }
        );
    const subSubCategoryOptions =
        subSubCategoriesData?.data?.sub_subcategories?.map(
            (subCategory: TSubCategory) => ({
                label: subCategory?.name_en,
                value: subCategory?._id
            })
        ) || [];

    // === thumbnail and slider images state ===
    const [thumbnail, setThumbnail] = useState<File | string | undefined>('');
    const [sliderImages, setSliderImages] = useState<(string | File)[]>([]);

    // === short videos (story / tiktok style) state ===
    const [shortVideos, setShortVideos] = useState<TProductShortVideo[]>([]);

    // === get logged in client profile ===
    // const { profile } = useGetLoggedInProfile();

    // === router ===
    const router = useRouter();

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

    // === file upload api mutation hook ===
    const [uploadSingleFile, { isLoading: isUploadFileLoading }] =
        useUploadFileToAWSMutation();
    const [uploadMultipleFileToAWS] = useUploadMultipleFileToAWSMutation();
    // === create product api mutation hook ===
    const [createProduct, { isLoading: isCreateProductLoading }] =
        useCreateProductMutation();

    // === handle form submission ===
    const handleAddNewProduct = async (data: z.infer<typeof ProductSchema>) => {
        try {
            setLoading(true);
            // First, upload variant files if there are any
            const processedVariants = newAttributesAndVariants?.variants || [];
            //  if (rawVariantsWithFiles && rawVariantsWithFiles.length > 0) {
            //   processedVariants = await uploadVariantFilesAndGetPayload(
            //    rawVariantsWithFiles,
            //    uploadFileToAWS,
            //   );
            //  }

            const payload: any = {
                ...data,
                attributes:
                    (newAttributesAndVariants &&
                        newAttributesAndVariants?.attributes) ||
                    [],
                variantsCombination: processedVariants,
                sku: rootLevelSKU || ''
            };

            // Only add dynamic_specs if the user has filled in the data
            if (dynamicSpecs && dynamicSpecs.length > 0) {
                payload.dynamic_specs = dynamicSpecs;
            }

            // Only add product_specifications if the user has filled in the data
            if (productSpecifications && productSpecifications.length > 0) {
                payload.product_specifications = productSpecifications;
            }

            // Only add product_card_properties if the user has filled in the data
            if (productCardProperties && productCardProperties.length > 0) {
                payload.product_card_properties = productCardProperties;
            }

            const response: any = await uploadSingleFile(thumbnail);

            if (response?.data?.success) {
                payload.thumbnail = response?.data?.data?.url;
            }

            payload.slider_images = [...preUploadedSliderUrls];

            // short videos (already uploaded to AWS by the component)
            if (shortVideos && shortVideos.length > 0) {
                payload.short_videos = shortVideos;
            }

            // create product api mutation
            const res: any = await createProduct({ payload });

            if (res?.data?.success) {
                toast.success('New Product Added!');
                setLoading(false);
                if (actionType === 'SAVE') {
                    router.replace('/admin/products');
                } else if (actionType === 'SAVE_AND_ADD') {
                    router.replace('/admin/create-product');
                    router.refresh();
                } else if (actionType === 'SAVE_AND_OPEN_STOCK') {
                    router.replace('/admin/purchase/create');
                }
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to add new product!'
                );
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.log('CREATE PRODUCT ERROR: ', error);
            toast.error('Something went wrong! Try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        const uploadSliderImagesInstantly = async () => {
            // filter new files (not strings)
            const newFiles = sliderImages.filter(
                (item) => typeof item === 'object'
            ) as File[];

            if (newFiles.length === 0) return;

            try {
                const response: any = await uploadMultipleFileToAWS(newFiles);

                if (response?.data?.success) {
                    const uploadedUrls = response?.data?.data?.urls || [];
                    setPreUploadedSliderUrls((prev) => [
                        ...prev,
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

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleAddNewProduct)}
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
                                            <EditorToolbar editor={editor} />
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
                                                            const newSpecs = [
                                                                ...dynamicSpecs
                                                            ];
                                                            newSpecs[index] = {
                                                                ...newSpecs[
                                                                    index
                                                                ],
                                                                title: e.target
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
                                                        value={spec.description}
                                                        onChange={(e) => {
                                                            const newSpecs = [
                                                                ...dynamicSpecs
                                                            ];
                                                            newSpecs[index] = {
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
                                                            const newSpecs = [
                                                                ...dynamicSpecs
                                                            ];
                                                            newSpecs[index] = {
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
                                                                    (_, i) =>
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
                                        }}
                                        defaultValue={
                                            field.value !== undefined
                                                ? field.value
                                                : undefined
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a category' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categoryOptions?.map(
                                                (
                                                    category: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={category.value}
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
                                        }}
                                        defaultValue={
                                            field.value !== undefined
                                                ? field.value
                                                : undefined
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a sub category' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subCategoryOptions?.map(
                                                (
                                                    subCategory: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            subCategory.value
                                                        }
                                                    >
                                                        {subCategory.label}
                                                    </SelectItem>
                                                )
                                            )}

                                            {subCategoryOptions?.length ===
                                                0 && (
                                                <div className='rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden'>
                                                    No sub categories available
                                                </div>
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
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a brand' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {brandOptions.map((option: any) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}

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
                                            defaultValue={field.value}
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
                                                onCheckedChange={field.onChange}
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
                                                            value={spec.title}
                                                            onChange={(e) => {
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
                                                                Current Value
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
                                                                    (_, i) =>
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
                                                { title: '', description: [] }
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
                                                            onChange={(e) => {
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
                                                            onChange={(e) => {
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
                                                                        e.target
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
                                                            onChange={(e) => {
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
                                                                        e.target
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
                                                            onChange={(e) => {
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
                                                                        e.target
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
                                                            onChange={(e) => {
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
                                                                        e.target
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
                                                            onChange={(e) => {
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
                                                                        e.target
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
                                                                    (_, i) =>
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
                                                onCheckedChange={field.onChange}
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
                                                onCheckedChange={field.onChange}
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
                                                                {option.label}
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
                            <h3 className='text-sm font-medium'>Thumbnail</h3>
                            <ImageUploadInput
                                mode='single'
                                inputId='thumbnail-image-upload'
                                onChange={(images) => {
                                    setThumbnail(images[0]);
                                }}
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
                        />
                    </div>
                </div>

                {/* Add variant form */}
                {/* <AttributesAndVariantsAddOrUpdate
          onChange={setNewAttributesAndVariants}
          defaultRegularPrice={0}
          defaultSalePrice={0}
          rootLevelSKU={rootLevelSKU}
          setRootLevelSKU={setRootLevelSKU}
          onRawVariantsChange={setRawVariantsWithFiles}
        /> */}
                <AttributesAndVariantsAddOrUpdate
                    onChange={setNewAttributesAndVariants}
                    defaultRegularPrice={0}
                    defaultSalePrice={0}
                    rootLevelSKU={rootLevelSKU}
                    setRootLevelSKU={setRootLevelSKU}
                    sliderImages={preUploadedSliderUrls}
                />

                {/* submit button */}
                <div className='ms-auto flex w-fit items-center gap-2'>
                    <Button
                        type='submit'
                        className=''
                        size={'xl'}
                        variant={'outline'}
                        onClick={() => setActionType('SAVE_AND_OPEN_STOCK')}
                        disabled={
                            isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading
                        }
                    >
                        Save & Open Stock
                        {(isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading) && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                    <Button
                        type='submit'
                        variant={'action'}
                        size={'xl'}
                        onClick={() => setActionType('SAVE_AND_ADD')}
                        disabled={
                            isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading
                        }
                    >
                        Save & Add Another
                        {(isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading) && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                    <Button
                        onClick={() => setActionType('SAVE')}
                        type='submit'
                        size={'xl'}
                        disabled={
                            isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading
                        }
                    >
                        Save
                        {(isUploadFileLoading ||
                            isCreateProductLoading ||
                            loading) && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateProductForm;
