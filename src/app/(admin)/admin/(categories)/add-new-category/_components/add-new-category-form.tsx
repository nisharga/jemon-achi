'use client';
import type { Resolver } from 'react-hook-form';

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
import { createCategorySchema } from '@/admin/schema/category';
import React, { useState } from 'react';
import { ImageUploadInput } from '@/admin/components/ui/image-upload-input';
import { toast } from 'sonner';
import { Loader, Video, ImageIcon } from 'lucide-react';
import { useUploadFileToAWSMutation } from '@/admin/redux/api-queries/file-upload-api';
import { useCreateCategoryMutation } from '@/admin/redux/api-queries/category-api';
import { useRouter } from 'next/navigation';

const AddNewCategoryForm = () => {
    // Media States
    const [square, setSquare] = useState<{ img?: File; vid?: File }>({});
    console.log('square: ', square?.img);
    const [horizontal, setHorizontal] = useState<{ img?: File; vid?: File }>(
        {}
    );
    const [vertical, setVertical] = useState<{ img?: File; vid?: File }>({});

    const [uploadFile, { isLoading: isFileUploading }] =
        useUploadFileToAWSMutation();

    // === create category api mutation hook ===
    const [createCategory, { isLoading: isCreateCategoryLoading }] =
        useCreateCategoryMutation();

    const form = useForm<z.infer<typeof createCategorySchema>>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(createCategorySchema) as Resolver<
            z.infer<typeof createCategorySchema>
        >,
        defaultValues: {
            name_en: '',
            name_bn: '',
            description_en: '',
            description_bn: '',
            position: 1
        }
    });

    const router = useRouter();

    // Handle Submit
    const handleSubmitCategory = async (
        values: z.infer<typeof createCategorySchema>
    ) => {
        const mediaArray: any[] = [];

        try {
            const uploadHelper = async (
                size: string,
                files: { img?: File; vid?: File }
            ) => {
                if (!files.img) return;

                // Upload Image
                const imgRes = await uploadFile(files.img).unwrap();
                // Based on your Postman: res.data.url
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

            // Process all three slots
            await Promise.all([
                uploadHelper('SQUARE', square),
                uploadHelper('HORIZONTAL', horizontal),
                uploadHelper('VERTICAL', vertical)
            ]);

            const payload = {
                ...values,
                media: mediaArray
            };

            // create category api mutations
            const res: any = await createCategory({
                payload
            });
            if (res?.data?.success) {
                toast.success('New category added!');

                router.replace('/admin/categories');

                form.reset({
                    name_en: '',
                    name_bn: '',
                    description_en: '',
                    description_bn: '',
                    position: 1
                });
            }
        } catch (error) {
            console.error('Upload process failed:', error);
            toast.error('File upload failed. Please try again.');
        } finally {
            console.log('error');
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmitCategory)}
                className='space-y-8'
            >
                {/* Text Fields */}
                <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='name_en'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name (English)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter category name in English'
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
                                    <FormLabel>Name (Bangla)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='বাংলায় ক্যাটাগরির নাম লিখুন'
                                            {...field}
                                        />
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
                                    <FormLabel>Description (English)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Short description in English'
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
                                    <FormLabel>Description (Bangla)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='সংক্ষিপ্ত বর্ণনা বাংলায় লিখুন'
                                            {...field}
                                        />
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

                {/* Media Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Square */}
                    <MediaCard
                        title='Square (1:1)'
                        onImageChange={(f: File) =>
                            setSquare((prev) => ({ ...prev, img: f }))
                        }
                        onVideoChange={(f: File) =>
                            setSquare((prev) => ({ ...prev, vid: f }))
                        }
                    />
                    {/* Horizontal */}
                    <MediaCard
                        title='Horizontal (16:9)'
                        onImageChange={(f: File) =>
                            setHorizontal((prev) => ({ ...prev, img: f }))
                        }
                        onVideoChange={(f: File) =>
                            setHorizontal((prev) => ({ ...prev, vid: f }))
                        }
                    />
                    {/* Vertical */}
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

                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        size='lg'
                        disabled={isFileUploading || isCreateCategoryLoading}
                    >
                        {isFileUploading || isCreateCategoryLoading ? (
                            <Loader className='mr-2 animate-spin' />
                        ) : null}
                        Create Category
                    </Button>
                </div>
            </form>
        </Form>
    );
};

// Sub-component to prevent infinite re-renders by isolating state updates
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
                    inputId={`img-${title.replace(/\s+/g, '-')}`} // Stable ID
                    onChange={(files) => {
                        // Only call if files exist and prevent undefined errors
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

export default AddNewCategoryForm;
