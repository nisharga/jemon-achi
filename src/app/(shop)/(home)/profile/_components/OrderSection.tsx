'use client';
import { Button } from '@/shop/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/shop/components/ui/card';
import { useGetMyOrderQuery } from '@/shop/redux/api/auth-api';
import { Play, SquareArrowRight, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod/v3';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/shop/components/ui/dialog';
import { Textarea } from '@/shop/components/ui/textarea';
import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import Image from 'next/image';
import { useUploadFileMutation } from '@/shop/redux/api/file-upload-api';
import { getMediaUrl } from '@/shop/lib/get-media-url';

import { motion } from 'framer-motion';
import { NoOrderMessage, SkeletonOrderTable } from './ProfileSkeleton';
import { formatTableDate } from '@/shop/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shop/components/ui/table';
import Link from 'next/link';
import { useCreateReviewMutation } from '@/shop/redux/api/review';
import CartTitle from './CartTitle';
import ErrorState, { NoData } from '@/shop/components/global/ErrorState';

const OrderSection = () => {
    const [selectedItem, setSelectedItem] = useState<{
        productId: string;
        productName: string;
        orderId: string;
    } | null>(null);

    // get my order
    const { data, isLoading, isError, refetch } = useGetMyOrderQuery({});
    const orders = data?.data?.data || [];
    const orderLength = data?.data?.data?.length || 0;

    return (
        <div className='space-y-6'>
            <Card className='border-0 bg-white shadow-sm'>
                <CardHeader className='border-b border-gray-100 bg-gray-50/50'>
                    <CartTitle
                        title='Order History'
                        icon={
                            <ShoppingBag className='h-5 w-5 text-secondary' />
                        }
                    />
                </CardHeader>

                <div className='w-full overflow-x-auto px-2 lg:px-8'>
                    <div className='min-w-[600px] md:min-w-full'>
                        {isError ? (
                            <ErrorState isError={isError} onRetry={refetch} />
                        ) : isLoading ? (
                            <SkeletonOrderTable />
                        ) : !orders || orderLength === 0 ? (
                            <NoData message='No orders found.' />
                        ) : (
                            <Table className='w-full overflow-x-scroll px-4'>
                                <TableHeader className='bg-gray-50/80'>
                                    <TableRow className='hover:bg-transparent'>
                                        <TableHead className='xs-normal w-[10px] tracking-wider uppercase'>
                                            Order Detail
                                        </TableHead>
                                        <TableHead className='xs-normal tracking-wider uppercase'>
                                            Products
                                        </TableHead>
                                        <TableHead className='xs-normal tracking-wider uppercase'>
                                            Status
                                        </TableHead>
                                        <TableHead className='xs-normal text-right tracking-wider uppercase'>
                                            Write a Review
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                {orders?.map((order: any) => (
                                    <TableBody
                                        key={order?._id}
                                        className='border-b last:border-0'
                                    >
                                        {order?.products.map(
                                            (item: any, index: number) => (
                                                <TableRow
                                                    key={item?._id}
                                                    className='group transition-colors hover:bg-gray-50/40'
                                                >
                                                    {/* Order ID & Track Button - Only show on the first row of the order group */}
                                                    {index === 0 ? (
                                                        <TableCell
                                                            className='pt-6 align-top'
                                                            rowSpan={
                                                                order?.products
                                                                    ?.length
                                                            }
                                                        >
                                                            <div className='space-y-2'>
                                                                <div>
                                                                    <p className='sm-normal-gray uppercase'>
                                                                        Order ID
                                                                    </p>
                                                                    <p className='sm-normal'>
                                                                        #
                                                                        {
                                                                            order?.order_serial_id
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <Link
                                                                    href={`/track?order=${order.order_serial_id}`}
                                                                >
                                                                    <Button
                                                                        variant='outline'
                                                                        size='sm'
                                                                        className='flex h-7 items-center justify-center gap-1 border-primary/20 px-2 text-[11px] text-primary hover:bg-primary/5'
                                                                    >
                                                                        Track{' '}
                                                                        <SquareArrowRight className='h-3 w-3 font-thin text-primary' />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    ) : null}

                                                    {/* Product Column */}
                                                    <TableCell className='py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                                                                <Image
                                                                    src={getMediaUrl(
                                                                        item
                                                                            ?.product
                                                                            ?.thumbnail
                                                                    )}
                                                                    alt={
                                                                        item
                                                                            ?.product
                                                                            ?.name
                                                                    }
                                                                    className='h-full w-full object-cover'
                                                                    width={500}
                                                                    height={500}
                                                                />
                                                            </div>
                                                            <div className='max-w-[200px] lg:max-w-xs'>
                                                                <p className='sm-normal truncate'>
                                                                    {
                                                                        item
                                                                            ?.product
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <div className='mt-1 flex flex-wrap gap-1'>
                                                                    {Object.entries(
                                                                        item
                                                                            .selected_variant
                                                                            .attribute_values
                                                                    ).map(
                                                                        ([
                                                                            key,
                                                                            val
                                                                        ]) => (
                                                                            <span
                                                                                key={
                                                                                    key
                                                                                }
                                                                                className='xs-normal rounded bg-gray-100 px-1.5 py-0.5'
                                                                            >
                                                                                {
                                                                                    key
                                                                                }

                                                                                :{' '}
                                                                                {
                                                                                    val as string
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Status Column - Showing per-order status */}
                                                    <TableCell className='align-middle'>
                                                        <span
                                                            className={cn(
                                                                'xs-normal rounded-full px-2 py-0.5 tracking-tighter uppercase',
                                                                order.status ===
                                                                    'PLACED'
                                                                    ? 'border border-blue-100 bg-blue-50 text-blue-600'
                                                                    : 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                                            )}
                                                        >
                                                            {order?.status}
                                                        </span>
                                                    </TableCell>

                                                    {/* Price & Review Action Column */}
                                                    <TableCell className='text-right align-middle'>
                                                        <div className='flex flex-col items-end gap-1'>
                                                            <motion.div
                                                                whileHover={{
                                                                    y: -2
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.95
                                                                }}
                                                            >
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    className={`xss-normal h-7 gap-1 text-primary hover:bg-primary/10 ${order.status !== 'DELIVERED' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                                    onClick={() =>
                                                                        setSelectedItem(
                                                                            {
                                                                                productId:
                                                                                    item
                                                                                        ?.product
                                                                                        ._id,
                                                                                productName:
                                                                                    item
                                                                                        ?.product
                                                                                        .name,
                                                                                orderId:
                                                                                    order?._id
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        order.status !==
                                                                        'DELIVERED'
                                                                    }
                                                                >
                                                                    <Star className='h-3 w-3 fill-current' />
                                                                    Review
                                                                </Button>
                                                            </motion.div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                ))}
                            </Table>
                        )}
                    </div>
                </div>
            </Card>

            {/* Modals */}
            {selectedItem && (
                <ReviewModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    productId={selectedItem.productId}
                    productName={selectedItem.productName}
                    orderId={selectedItem.orderId}
                />
            )}
        </div>
    );
};

export default OrderSection;

const reviewSchema = z.object({
    title: z.string().max(20).optional(),
    content: z
        .string()
        .min(24, 'Review must be at least 24 characters')
        .max(500),
    rating: z.number().int().min(1, 'Please select a rating').max(5)
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    orderId: string;
    variantId?: string;
}

export const ReviewModal = ({
    isOpen,
    onClose,
    productId,
    productName,
    orderId,
    variantId
}: ReviewModalProps) => {
    const [rating, setRating] = useState(0);

    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [createReview, { isLoading: isSubmitting }] =
        useCreateReviewMutation();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0 }
    });

    const handleRating = (val: number) => {
        setRating(val);
        setValue('rating', val);
    };

    // 1. Updated State
    // We store the local preview AND the server URL
    const [mediaFiles, setMediaFiles] = useState<
        {
            type: 'image' | 'video';
            url: string; // Server URL
            preview: string; // Local blob URL for instant UI
        }[]
    >([]);

    // 2. Handle File Selection & Instant Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create an instant local preview
        const localPreview = URL.createObjectURL(file);
        const fileType = file.type.startsWith('video') ? 'video' : 'image';

        // Add a "loading" state locally first
        const tempId = Math.random().toString();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res: any = await uploadFile({ file: formData }).unwrap();
            if (res?.success) {
                setMediaFiles((prev) => [
                    ...prev,
                    { type: fileType, url: res.data.url, preview: localPreview }
                ]);
                toast.success('Uploaded successfully');
            }
        } catch (err) {
            toast.error('Upload failed');
            // Clean up memory if upload fails
            URL.revokeObjectURL(localPreview);
        }
    };

    // 3. Remove File (The "X" button)
    const removeFile = (index: number) => {
        setMediaFiles((prev) => {
            const newFiles = [...prev];
            // Clean up the memory for the blob URL
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const onSubmit = async (values: ReviewFormValues) => {
        try {
            const payload = {
                ...values,
                product: productId,
                order: orderId,
                // variant: variantId,
                media: mediaFiles.map((m) => ({
                    type: m.type,
                    url: m.url, // Only send the server URL
                    altText: values.title || 'Review Media'
                }))
            };

            const res: any = await createReview(payload).unwrap();
            console.log('res: ', res);

            if (res?.success) {
                toast.success('Review submitted!');
                // Clean up all blob URLs from memory
                mediaFiles.forEach((file) => URL.revokeObjectURL(file.preview));
                reset();
                setRating(0);
                setMediaFiles([]);
                onClose();
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to submit review');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle className='font-normal'>
                        Write a Review for {productName}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='space-y-4 py-4'
                >
                    {/* Rating Stars */}
                    <div className='space-y-2 text-center'>
                        <Label className='sm-medium'>Your Rating</Label>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'h-8 w-8 cursor-pointer transition-colors',
                                        star <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    )}
                                    onClick={() => handleRating(star)}
                                />
                            ))}
                        </div>
                        {errors.rating && (
                            <p className='text-[11px] text-red-500'>
                                {errors.rating.message}
                            </p>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='title' className='sm-medium'>
                            Title (Optional)
                        </Label>
                        <Input
                            id='title'
                            {...register('title')}
                            placeholder='Summarize your experience'
                            className='placeholder:sm-medium sm-medium'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='content' className='sm-medium'>
                            Review Content
                        </Label>
                        <Textarea
                            id='content'
                            {...register('content')}
                            placeholder='What did you like or dislike?'
                            className='placeholder:sm-medium sm-medium min-h-[100px]'
                        />
                        {errors.content && (
                            <p className='text-[11px] text-red-500'>
                                {errors.content.message}
                            </p>
                        )}
                    </div>

                    {/* Media Upload */}
                    <div className='space-y-2'>
                        <Label className='sm-medium'>Add Photos/Videos</Label>
                        <div className='flex flex-wrap gap-2'>
                            {mediaFiles.map((file, i) => (
                                <div
                                    key={i}
                                    className='group relative h-16 w-16 overflow-hidden rounded-md border bg-gray-50'
                                >
                                    {/* Remove Button (X) */}
                                    <button
                                        type='button'
                                        onClick={() => removeFile(i)}
                                        className='absolute top-0.5 right-0.5 z-10 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-500'
                                    >
                                        <X size={12} />
                                    </button>

                                    {file.type === 'image' ? (
                                        <Image
                                            width={64}
                                            height={64}
                                            // Use preview for instant UI, fallback to server URL
                                            src={getMediaUrl(file.preview)}
                                            className='h-full w-full object-cover'
                                            alt='upload preview'
                                        />
                                    ) : (
                                        <div className='flex h-full items-center justify-center bg-slate-900'>
                                            <Play
                                                size={16}
                                                className='text-white'
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* The Upload Trigger Button */}
                            <label className='flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-all hover:border-primary hover:bg-gray-50'>
                                {isUploading ? (
                                    <Loader2 className='animate-spin text-primary' />
                                ) : (
                                    <Upload
                                        size={20}
                                        className='text-gray-400'
                                    />
                                )}
                                <input
                                    type='file'
                                    className='hidden'
                                    onChange={handleFileUpload}
                                    accept='image/*,video/*'
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            className='font-normal'
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isSubmitting || isUploading}
                            className='sm-medium'
                        >
                            {isSubmitting ||
                                (isUploading && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ))}
                            {isUploading ? 'Uploading...' : 'Submit Review'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Helper function for class merging
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
