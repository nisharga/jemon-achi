'use client';

import React, { useEffect, useState, memo, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/admin/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import { Input } from '@/admin/components/ui/input';
import { updateCategorySchema } from '@/admin/schema/category';
import { ImageUploadInput } from '@/admin/components/ui/image-upload-input';
import {
    useGetSingleCategoryQuery,
    useUpdateCategoryMutation
} from '@/admin/redux/api-queries/category-api';
import { TCategory } from '@/admin/types/category';
import { Loader, ImageIcon, Play, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFileToAWSMutation } from '@/admin/redux/api-queries/file-upload-api';
import { useRouter } from 'next/navigation';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { VideoPreviewModal } from './VideoUploadModal';
import { getImgFullUrl } from '@/admin/lib/utils';

const UpdateCategoryForm = ({ slug }: { slug: string }) => {
    const router = useRouter();
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_UPDATE]
    });

    const { data, isLoading: isSingleCategoryLoading } =
        useGetSingleCategoryQuery({ category_id: slug });
    const category: TCategory = data?.data;

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

    console.log('square', square);

    const [uploadFile, { isLoading: isFileUploading }] =
        useUploadFileToAWSMutation();
    const [updateCategory, { isLoading: isUpdateCategoryLoading }] =
        useUpdateCategoryMutation();

    const form = useForm<z.infer<typeof updateCategorySchema>>({
        resolver: zodResolver(updateCategorySchema)
    });

    // Sync state once data is available
    useEffect(() => {
        if (category) {
            form.reset({
                name_en: category.name_en || '',
                name_bn: category.name_bn || '',
                description_en: category.description_en || '',
                description_bn: category.description_bn || '',
                position: category.position || 1
            });

            const mediaMap: any = { SQUARE: {}, HORIZONTAL: {}, VERTICAL: {} };
            category.media?.forEach((m: any) => {
                mediaMap[m.size] = {
                    img: m.image || undefined,
                    vid: m.video || undefined
                };
            });

            console.log('mediaMap', mediaMap.SQUARE);

            setSquare(mediaMap?.SQUARE);
            setHorizontal(mediaMap?.HORIZONTAL);
            setVertical(mediaMap.VERTICAL);
        }
    }, [category, form]);

    const handleMediaUpdate = (setter: any, file: any, type: 'img' | 'vid') => {
        setter((prev: any) =>
            prev[type] === file ? prev : { ...prev, [type]: file }
        );
    };

    const handleUpdate = async (
        values: z.infer<typeof updateCategorySchema>
    ) => {
        // 1. Identify only changed text fields (Dirty fields)
        const payload: any = {};
        const dirtyFields = form.formState.dirtyFields;

        Object.keys(dirtyFields).forEach((key) => {
            payload[key] = (values as any)[key];
        });

        // 2. Process Media (only if changed)
        const mediaArray: any[] = [];
        try {
            // Get original media to track changes
            const originalMediaMap: any = {
                SQUARE: {},
                HORIZONTAL: {},
                VERTICAL: {}
            };
            category?.media?.forEach((m: any) => {
                originalMediaMap[m.size] = {
                    img: m.image || '',
                    vid: m.video || ''
                };
            });

            const processUpload = async (size: string, state: any) => {
                const entry: any = { size };

                // Handle Image
                if (state.img !== undefined) {
                    if (state.img === '') {
                        // Image was removed
                        entry.image = '';
                    } else if (state.img instanceof File) {
                        // New image uploaded
                        const res = await uploadFile(state.img).unwrap();
                        entry.image = res?.data?.url || '';
                    }
                    // If state.img is a string and unchanged, don't include it in payload
                    // Backend will keep existing value
                }

                // Handle Video
                if (state.vid !== undefined) {
                    if (state.vid === '') {
                        // Video was removed
                        entry.video = '';
                    } else if (state.vid instanceof File) {
                        // New video uploaded
                        const res = await uploadFile(state.vid).unwrap();
                        entry.video = res?.data?.url || '';
                    }
                }

                // Always add to mediaArray if either image or video is present
                if (entry.image !== undefined || entry.video !== undefined) {
                    mediaArray.push(entry);
                }
            };

            await Promise.all([
                processUpload('SQUARE', square),
                processUpload('HORIZONTAL', horizontal),
                processUpload('VERTICAL', vertical)
            ]);

            // Always include media in payload (even if empty array)
            // This ensures existing media is preserved if not updated
            payload.media = mediaArray;

            console.log('Final payload:', payload);

            const res: any = await updateCategory({
                payload,
                category_id: category?._id
            });

            if (res?.data?.success) {
                toast.success('Category updated successfully!');
                router.replace('/admin/categories');
            }
        } catch (error) {
            console.log('error: ', error);
            toast.error('Update failed. Please try again.');
        }
    };

    if (!isPermissionLoading && !hasPermission) return <PermissionErrorCard />;
    if (isPermissionLoading || isSingleCategoryLoading)
        return <PermissionLoaderCard />;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdate)}
                className='space-y-4'
            >
                <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='name_en'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name (EN)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                    <FormLabel>Name (BN)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='description_en'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (EN)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                    <FormLabel>Description (BN)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name='position'
                        render={({ field }) => (
                            <FormItem className='w-32'>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <MediaUpdateCard
                        title='Square (1:1)'
                        currentImage={square.img}
                        currentVideo={square.vid}
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setSquare, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setSquare, f, 'vid')
                        }
                    />
                    <MediaUpdateCard
                        title='Horizontal (16:9)'
                        currentImage={horizontal.img}
                        currentVideo={horizontal.vid}
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setHorizontal, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setHorizontal, f, 'vid')
                        }
                    />
                    <MediaUpdateCard
                        title='Vertical (9:16)'
                        currentImage={vertical.img}
                        currentVideo={vertical.vid}
                        onImageChange={(f: any) =>
                            handleMediaUpdate(setVertical, f, 'img')
                        }
                        onVideoChange={(f: any) =>
                            handleMediaUpdate(setVertical, f, 'vid')
                        }
                    />
                </div>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='ghost'
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        size='lg'
                        disabled={isFileUploading || isUpdateCategoryLoading}
                    >
                        {(isFileUploading || isUpdateCategoryLoading) && (
                            <Loader className='mr-2 animate-spin' />
                        )}
                        Update Category
                    </Button>
                </div>
            </form>
        </Form>
    );
};

const MediaUpdateCard = memo(
    ({
        title,
        onImageChange,
        onVideoChange,
        currentImage,
        currentVideo
    }: any) => {
        const [isPreviewOpen, setIsPreviewOpen] = useState(false);

        // Memoize video source to prevent unnecessary recalculations
        const videoSrc = useMemo(() => {
            if (currentVideo instanceof File)
                return URL.createObjectURL(currentVideo);
            if (typeof currentVideo === 'string' && currentVideo)
                return getImgFullUrl(currentVideo);
            return currentVideo;
        }, [currentVideo]);

        // Memoize image source for display
        const imageDisplaySrc = useMemo(() => {
            if (!currentImage) return undefined;
            if (currentImage instanceof File) return undefined; // Let ImageUploadInput handle File objects
            return getImgFullUrl(currentImage);
        }, [currentImage]);

        // Clean up blob URLs
        useEffect(() => {
            return () => {
                if (videoSrc && videoSrc.startsWith('blob:'))
                    URL.revokeObjectURL(videoSrc);
            };
        }, [videoSrc]);

        return (
            <div className='space-y-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/50'>
                <div className='flex items-center gap-2 border-b pb-2 font-medium'>
                    <ImageIcon className='h-4 w-4 text-primary' /> {title}
                </div>

                <div className='space-y-2'>
                    <FormLabel className='text-xs font-semibold text-muted-foreground'>
                        IMAGE ASSET
                    </FormLabel>
                    <div className='flex items-center gap-2'>
                        <div className='flex-1'>
                            <ImageUploadInput
                                mode='single'
                                inputId={`upd-img-${title.replace(/\s+/g, '-')}`}
                                defaultValue={
                                    imageDisplaySrc ? [imageDisplaySrc] : []
                                }
                                onChange={(files) => {
                                    onImageChange(files?.[0]);
                                }}
                            />
                        </div>
                        {currentImage && (
                            <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='h-9 w-9 text-destructive'
                                onClick={() => onImageChange('')}
                            >
                                <Trash2 className='h-4 w-4' />
                            </Button>
                        )}
                    </div>
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
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                <Play className='h-3 w-3 fill-current' />{' '}
                                Preview
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='h-9 w-9 text-destructive'
                                onClick={() => onVideoChange('')}
                            >
                                <Trash2 className='h-4 w-4' />
                            </Button>
                        </div>
                    ) : (
                        <Input
                            type='file'
                            accept='video/*'
                            className='h-9 text-xs'
                            onChange={(e) => onVideoChange(e.target.files?.[0])}
                        />
                    )}
                </div>

                {videoSrc && (
                    <VideoPreviewModal
                        isOpen={isPreviewOpen}
                        onClose={() => setIsPreviewOpen(false)}
                        videoUrl={videoSrc}
                        title={title}
                    />
                )}
            </div>
        );
    }
);

MediaUpdateCard.displayName = 'MediaUpdateCard';

export default UpdateCategoryForm;
