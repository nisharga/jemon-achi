'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
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
import { createSubCategorySchema } from '@/schema/sub-category';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetAllCategoriesQuery } from '@/redux/api-queries/category-api';
import { TCategory } from '@/types/category';
import Image from 'next/image';
import { useUploadFileToAWSMutation } from '@/redux/api-queries/file-upload-api';
import {
    useCreateSubCategoryMutation,
    useCreateSubSubCategoryMutation,
    useGetAllSubCategoryQuery
} from '@/redux/api-queries/subcategory-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader, Video, ImageIcon, Loader2 } from 'lucide-react';
import { getImgFullUrl } from '@/lib/admin-utils';

const AddNewSubCategoryForm = () => {
    const router = useRouter();

    // Media States - 3 sizes like category form
    const [square, setSquare] = useState<{ img?: File; vid?: File }>({});
    const [horizontal, setHorizontal] = useState<{ img?: File; vid?: File }>(
        {}
    );
    const [vertical, setVertical] = useState<{ img?: File; vid?: File }>({});

    const { data, isLoading: isGetAllCategoriesLoading } =
        useGetAllCategoriesQuery({ page: 1, limit: 100 });
    const categories = data?.data?.data;

    const { data: subCat, isLoading: isSubCatLoading } =
        useGetAllSubCategoryQuery({ page: 1, limit: 100 });
    const subCategoriesList = subCat?.data?.subcategories || [];

    const loading = isGetAllCategoriesLoading || isSubCatLoading;

    const categoryOptions = categories?.map((category: TCategory) => ({
        value: category?._id,
        label: category?.name_en,
        img: category?.image_url
    }));

    const form = useForm<any>({
        resolver: zodResolver(createSubCategorySchema),
        defaultValues: {
            name_en: '',
            name_bn: '',
            description_en: '',
            description_bn: '',
            category: '',
            sub_category: 'none'
        }
    });

    const selectedCategory = useWatch({
        control: form.control,
        name: 'category'
    });

    // When category changes, reset sub_category to "none"
    useEffect(() => {
        form.setValue('sub_category', 'none');
    }, [selectedCategory, form]);

    const filteredSubCategories = subCategoriesList.filter(
        (item: any) => item.category?._id === selectedCategory
    );

    const [uploadFile, { isLoading: isUploadFileLoading }] =
        useUploadFileToAWSMutation();
    const [createSubCategory, { isLoading: isCreateSubCategoryLoading }] =
        useCreateSubCategoryMutation();

    const [createSubSubCategory, { isLoading: isCreateSubSubCategoryLoading }] =
        useCreateSubSubCategoryMutation();

    const handleAddNewSubCategory = async (data: any) => {
        // IMPORTANT: Get sub_category directly from form state in case Zod stripped it
        const currentSubCategory = form.getValues('sub_category');

        // Check if at least one image is uploaded
        if (!square.img && !horizontal.img && !vertical.img) {
            toast.error(
                'Please upload at least one image (Square, Horizontal, or Vertical)'
            );
            return;
        }

        try {
            const mediaArray: any[] = [];

            // Upload helper function
            const uploadHelper = async (
                size: string,
                files: { img?: File; vid?: File }
            ) => {
                if (!files.img) return;

                // Upload Image
                const imgRes = await uploadFile(files.img).unwrap();
                const imageUrl = imgRes?.data?.url;

                const entry: any = {
                    size: size,
                    image: imageUrl
                };

                // Upload Video if exists
                if (files.vid) {
                    const vidRes = await uploadFile(files.vid).unwrap();
                    entry.video = vidRes?.data?.url;
                }

                mediaArray.push(entry);
            };

            // Process all three sizes
            await Promise.all([
                uploadHelper('SQUARE', square),
                uploadHelper('HORIZONTAL', horizontal),
                uploadHelper('VERTICAL', vertical)
            ]);

            const basePayload = {
                name_en: data?.name_en,
                name_bn: data?.name_bn,
                description_en: data?.description_en,
                description_bn: data?.description_bn,
                category: data?.category,
                media: mediaArray,
                position: 1
            };

            // Strict check against "none" and undefined
            if (currentSubCategory && currentSubCategory !== 'none') {
                const payload2 = {
                    ...basePayload,
                    subcategory: currentSubCategory
                };
                console.log('SUCCESS: payload 2', payload2);

                // create sub category api mutations
                const res: any = await createSubSubCategory({
                    payload: payload2
                });
                if (res?.data?.success) {
                    toast.success('New sub category added!');
                    // Reset media states
                    setSquare({});
                    setHorizontal({});
                    setVertical({});
                    router.replace('/admin/sub-categories');

                    // reset form
                    form.reset({
                        name_en: '',
                        name_bn: '',
                        description_en: '',
                        description_bn: '',
                        category: undefined
                    });
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message ||
                            'Failed to add sub category. Try again!'
                    );
                }
            } else {
                // create sub category api mutations
                const res: any = await createSubCategory({
                    payload: basePayload
                });
                if (res?.data?.success) {
                    toast.success('New sub category added!');
                    // Reset media states
                    setSquare({});
                    setHorizontal({});
                    setVertical({});
                    router.replace('/admin/sub-categories');

                    // reset form
                    form.reset({
                        name_en: '',
                        name_bn: '',
                        description_en: '',
                        description_bn: '',
                        category: undefined
                    });
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message ||
                            'Failed to add sub category. Try again!'
                    );
                }
            }
        } catch (error) {
            console.log('error: ', error);
            toast.error('An error occurred during upload');
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleAddNewSubCategory)}
                className='w-full space-y-6'
            >
                <div className='grid grid-cols-1 gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:grid-cols-2 lg:p-6'>
                    <FormField
                        control={form.control}
                        name='name_en'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Category Name (En)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter sub category name (en)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='name_bn'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Category Name (Bn)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter sub category name (bn)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='description_en'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Sub Category Description (En)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter sub category description (en)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='description_bn'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Sub Category Description (Bn)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter sub category description (bn)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='category'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl className='w-full'>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a category' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoryOptions?.map(
                                            (option: any, index: number) => (
                                                <SelectItem
                                                    key={index}
                                                    value={option?.value}
                                                >
                                                    <div className='flex items-center gap-2'>
                                                        <Image
                                                            src={getImgFullUrl(
                                                                option?.img
                                                            )}
                                                            alt=''
                                                            height={20}
                                                            width={20}
                                                            className='size-5 rounded-md object-cover'
                                                        />
                                                        {option?.label}
                                                    </div>
                                                </SelectItem>
                                            )
                                        )}
                                        {loading && (
                                            <Loader2 className='h-4 w-4 animate-spin text-center opacity-50' />
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='sub_category'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Category (Optional)</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedCategory}
                                >
                                    <FormControl className='w-full'>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a sub category' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='none'>
                                            None
                                        </SelectItem>
                                        {filteredSubCategories?.map(
                                            (item: any, index: number) => (
                                                <SelectItem
                                                    key={index}
                                                    value={item._id}
                                                >
                                                    {item.name_en}
                                                </SelectItem>
                                            )
                                        )}

                                        {loading && (
                                            <Loader2 className='h-4 w-4 animate-spin text-center opacity-50' />
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Media Grid - 3 sizes */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <MediaCard
                        title='Square (1:1)'
                        onImageChange={(f: File) =>
                            setSquare((prev) => ({ ...prev, img: f }))
                        }
                        onVideoChange={(f: File) =>
                            setSquare((prev) => ({ ...prev, vid: f }))
                        }
                    />
                    <MediaCard
                        title='Horizontal (16:9)'
                        onImageChange={(f: File) =>
                            setHorizontal((prev) => ({ ...prev, img: f }))
                        }
                        onVideoChange={(f: File) =>
                            setHorizontal((prev) => ({ ...prev, vid: f }))
                        }
                    />
                    <MediaCard
                        title='Vertical (9:16)'
                        onImageChange={(f: File) =>
                            setVertical((prev) => ({ ...prev, img: f }))
                        }
                        onVideoChange={(f: File) =>
                            setVertical((prev) => ({ ...prev, vid: f }))
                        }
                    />
                </div>

                <div className='ms-auto w-fit'>
                    <Button
                        type='submit'
                        disabled={
                            isUploadFileLoading ||
                            isCreateSubCategoryLoading ||
                            isCreateSubSubCategoryLoading
                        }
                    >
                        {isUploadFileLoading ||
                        isCreateSubCategoryLoading ||
                        isCreateSubSubCategoryLoading ? (
                            <>
                                <Loader className='mr-2 animate-spin' />{' '}
                                Processing...
                            </>
                        ) : (
                            'Add New Sub Category'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

// MediaCard component - same as category form
const MediaCard = React.memo(({ title, onImageChange, onVideoChange }: any) => {
    return (
        <div className='space-y-4 rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 border-b pb-2 font-medium'>
                <ImageIcon className='h-4 w-4 text-primary' /> {title}
            </div>
            <div className='space-y-2'>
                <FormLabel className='text-xs font-semibold'>Image</FormLabel>
                <ImageUploadInput
                    mode='single'
                    inputId={`img-${title.replace(/\s+/g, '-')}`}
                    onChange={(files) => {
                        if (files?.[0]) onImageChange(files[0]);
                    }}
                />
            </div>
            <div className='space-y-2'>
                <FormLabel className='flex items-center gap-1 text-xs font-semibold'>
                    <Video className='h-3 w-3' /> Optional Video
                </FormLabel>
                <Input
                    type='file'
                    accept='video/*'
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onVideoChange(file);
                    }}
                    className='text-xs'
                />
            </div>
        </div>
    );
});

MediaCard.displayName = 'MediaCard';

export default AddNewSubCategoryForm;
