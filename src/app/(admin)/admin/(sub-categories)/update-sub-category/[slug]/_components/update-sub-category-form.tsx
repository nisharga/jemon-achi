'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import React, { useEffect, useState } from 'react';
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
import { updateSubCategorySchema } from '@/schema/sub-category';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import Image from 'next/image';
import { TCategory } from '@/types/admin/category';
import {
    useGetSingleSubCategoryQuery,
    useUpdateSubCategoryMutation
} from '@/redux/admin/api/subcategory-api';
import { toast } from 'sonner';
import { TSubCategory } from '@/types/admin/sub-category';
import { Loader, Video, ImageIcon } from 'lucide-react';
import { useUploadFileToAWSMutation } from '@/redux/admin/api/file-upload-api';
import { useRouter } from 'next/navigation';
import { useGetAllCategoriesQuery } from '@/redux/admin/api/category-api';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { getImgFullUrl } from '@/lib/admin-utils';

const UpdateSubCategoryForm = ({ slug }: { slug: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_UPDATE]
    });

    // === router ===
    const router = useRouter();

    // === get single sub category ===
    const { data: singleSubcategory, isLoading: isSingleSubCategoryLoading } =
        useGetSingleSubCategoryQuery({ sub_category_id: slug });
    const subCategory: TSubCategory = singleSubcategory?.data;

    // === get all categories ===
    const { data } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categories = data?.data?.data;

    // Media States - 3 sizes
    const [square, setSquare] = useState<{
        img?: File | string;
        vid?: File | string;
    }>({});
    const [horizontal, setHorizontal] = useState<{
        img?: File | string;
        vid?: File | string;
    }>({});
    const [vertical, setVertical] = useState<{
        img?: File | string;
        vid?: File | string;
    }>({});

    // === form default values ===
    const form = useForm<z.infer<typeof updateSubCategorySchema>>({
        resolver: zodResolver(updateSubCategorySchema),

        defaultValues: {
            name_en: subCategory?.name_en || '',
            name_bn: subCategory?.name_bn || '',
            description_en: subCategory?.description_en || '',
            description_bn: subCategory?.description_bn || '',
            category: subCategory?.category?._id || ''
        }
    });

    // === file upload api mutation hook ===
    const [uploadFile, { isLoading: isFileUploading }] =
        useUploadFileToAWSMutation();

    // === update sub category api mutation hook ===
    const [updateSubCategory, { isLoading: isUpdateSubCategoryLoading }] =
        useUpdateSubCategoryMutation();

    // Sync state with API data
    useEffect(() => {
        if (subCategory) {
            form.reset({
                name_en: subCategory?.name_en || '',
                name_bn: subCategory?.name_bn || '',
                description_en: subCategory?.description_en || '',
                description_bn: subCategory?.description_bn || '',
                category: subCategory?.category?._id || ''
            });

            // Sync media data with full URLs
            const mediaMap: any = { SQUARE: {}, HORIZONTAL: {}, VERTICAL: {} };
            subCategory.media?.forEach((m: any) => {
                mediaMap[m.size] = {
                    img: m.image ? getImgFullUrl(m.image) : undefined,
                    vid: m.video ? getImgFullUrl(m.video) : undefined
                };
            });

            setSquare(mediaMap.SQUARE);
            setHorizontal(mediaMap.HORIZONTAL);
            setVertical(mediaMap.VERTICAL);
        }
    }, [subCategory, form]);

    const handleMediaUpdate = (setter: any, file: any, type: 'img' | 'vid') => {
        setter((prev: any) =>
            prev[type] === file ? prev : { ...prev, [type]: file }
        );
    };

    const handleUpdateSubCategory = async (
        data: z.infer<typeof updateSubCategorySchema>
    ) => {
        try {
            const mediaArray: any[] = [];

            // Upload helper function
            const uploadHelper = async (
                size: string,
                state: { img?: File | string; vid?: File | string }
            ) => {
                if (!state.img) return;

                let finalImageUrl = state.img;
                let finalVideoUrl = state.vid;
                let hasChanged = false;

                // Upload new image if it's a File
                if (state.img instanceof File) {
                    const imgRes = await uploadFile(state.img).unwrap();
                    finalImageUrl = imgRes?.data?.url;
                    hasChanged = true;
                }

                // Upload new video if it's a File
                if (state.vid instanceof File) {
                    const vidRes = await uploadFile(state.vid).unwrap();
                    finalVideoUrl = vidRes?.data?.url;
                    hasChanged = true;
                }

                // Only add to mediaArray if something changed
                if (
                    hasChanged ||
                    state.img instanceof File ||
                    state.vid instanceof File
                ) {
                    const entry: any = {
                        size: size,
                        image: finalImageUrl
                    };

                    if (finalVideoUrl) {
                        entry.video = finalVideoUrl;
                    }

                    mediaArray.push(entry);
                }
            };

            // Process all three sizes
            await Promise.all([
                uploadHelper('SQUARE', square),
                uploadHelper('HORIZONTAL', horizontal),
                uploadHelper('VERTICAL', vertical)
            ]);

            // Prepare payload
            const payload: any = {
                name_en: data?.name_en,
                name_bn: data?.name_bn,
                description_en: data?.description_en,
                description_bn: data?.description_bn,
                category: data?.category
            };

            // Only add media if there are changes
            if (mediaArray.length > 0) {
                payload.media = mediaArray;
            }

            // Update API Call
            const res: any = await updateSubCategory({
                payload,
                sub_category_id: subCategory?._id
            });

            if (res?.data?.success) {
                toast.success('Sub Category updated successfully!');
                router.replace('/admin/sub-categories');
            } else {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to update sub category.'
                );
            }
        } catch (error) {
            console.error('UPDATE ERROR:', error);
            toast.error('Something went wrong!');
        }
    };

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isSingleSubCategoryLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdateSubCategory)}
                className='w-full space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    {/* ===== name field (en) ===== */}
                    <FormField
                        control={form.control}
                        name='name_en'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Category Name (En)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter category name (en)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== name field (bn) ===== */}
                    <FormField
                        control={form.control}
                        name='name_bn'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Category Name (Bn)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter category name (bn)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== description field (en) ===== */}
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
                                        placeholder='Enter category description (en)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== description field (bn) ===== */}
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
                                        placeholder='Enter category description (bn)'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== category field ===== */}
                    <FormField
                        control={form.control}
                        name='category'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={(value) =>
                                        field.onChange(value)
                                    }
                                    defaultValue={subCategory?.category?._id}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue
                                                placeholder={
                                                    subCategory?.category
                                                        ?._id ||
                                                    'Select a category'
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.map(
                                            (category: TCategory) => {
                                                return (
                                                    <SelectItem
                                                        key={category?._id}
                                                        value={category?._id}
                                                    >
                                                        <Image
                                                            src={getImgFullUrl(
                                                                category
                                                                    ?.media?.[0]
                                                                    ?.image as string
                                                            )}
                                                            alt={
                                                                category?.name_en
                                                            }
                                                            height={100}
                                                            width={100}
                                                            className='size-6 rounded-md object-cover'
                                                        />{' '}
                                                        {category?.name_en}
                                                    </SelectItem>
                                                );
                                            }
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
                    <MediaUpdateCard
                        title='Square (1:1)'
                        currentImage={
                            typeof square?.img === 'string'
                                ? square.img
                                : undefined
                        }
                        currentVideo={
                            typeof square?.vid === 'string'
                                ? square.vid
                                : undefined
                        }
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setSquare, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setSquare, f, 'vid')
                        }
                    />
                    <MediaUpdateCard
                        title='Horizontal (16:9)'
                        currentImage={
                            typeof horizontal?.img === 'string'
                                ? horizontal.img
                                : undefined
                        }
                        currentVideo={
                            typeof horizontal?.vid === 'string'
                                ? horizontal.vid
                                : undefined
                        }
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setHorizontal, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setHorizontal, f, 'vid')
                        }
                    />
                    <MediaUpdateCard
                        title='Vertical (9:16)'
                        currentImage={
                            typeof vertical?.img === 'string'
                                ? vertical.img
                                : undefined
                        }
                        currentVideo={
                            typeof vertical?.vid === 'string'
                                ? vertical.vid
                                : undefined
                        }
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setVertical, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setVertical, f, 'vid')
                        }
                    />
                </div>

                {/* submit button */}
                <div className='ms-auto w-fit'>
                    <Button
                        type='submit'
                        disabled={isFileUploading || isUpdateSubCategoryLoading}
                    >
                        Update Sub Category
                        {(isFileUploading || isUpdateSubCategoryLoading) && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

// MediaUpdateCard component - same as category update form
const MediaUpdateCard = React.memo(
    ({
        title,
        onImageChange,
        onVideoChange,
        currentImage,
        currentVideo
    }: any) => {
        return (
            <div className='space-y-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/50'>
                <div className='flex items-center gap-2 border-b pb-2 font-medium'>
                    <ImageIcon className='h-4 w-4 text-primary' /> {title}
                </div>

                <div className='space-y-2'>
                    <FormLabel className='text-xs font-semibold text-muted-foreground'>
                        IMAGE ASSET
                    </FormLabel>
                    <ImageUploadInput
                        mode='single'
                        inputId={`upd-img-${title.replace(/\s+/g, '-')}`}
                        defaultValue={
                            typeof currentImage === 'string'
                                ? [currentImage]
                                : []
                        }
                        onChange={(files) => onImageChange(files?.[0])}
                    />
                </div>

                <div className='space-y-2'>
                    <FormLabel className='flex items-center gap-1 text-xs font-semibold text-muted-foreground'>
                        <Video className='h-3 w-3' /> VIDEO CONTENT
                    </FormLabel>

                    {currentVideo ? (
                        <div className='flex items-center gap-2'>
                            <Button
                                type='button'
                                variant='secondary'
                                className='h-9 flex-1 gap-2'
                            >
                                Video Selected
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='h-9 w-9 text-destructive'
                                onClick={() => onVideoChange(undefined)}
                            >
                                X
                            </Button>
                        </div>
                    ) : (
                        <Input
                            key={`video-input-${title}`}
                            type='file'
                            accept='video/*'
                            className='h-9 text-xs'
                            onChange={(e) => onVideoChange(e.target.files?.[0])}
                        />
                    )}
                </div>
            </div>
        );
    }
);

MediaUpdateCard.displayName = 'MediaUpdateCard';

export default UpdateSubCategoryForm;
