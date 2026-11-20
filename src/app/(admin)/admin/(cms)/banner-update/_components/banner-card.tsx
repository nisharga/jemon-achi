'use client';

import { Button } from '@/admin/components/ui/button';
import {
    useDeleteBannerMutation,
    useDeleteFeaturedBannerMutation,
    useDeleteMobileBannerMutation
} from '@/admin/redux/api-queries/banner-api';
import { TBanner } from '@/admin/types/banner';
import { Loader, Trash } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { toast } from 'sonner';
import { getImgFullUrl } from '@/admin/lib/utils';

type TBannerCardProps = {
    banner: TBanner;
    type: 'DESKTOP' | 'MOBILE' | 'FEATURED';
};

const BannerCard = ({ banner, type = 'DESKTOP' }: TBannerCardProps) => {
    // === delete banner api mutation ===
    const [deleteBannerMutation, { isLoading }] = useDeleteBannerMutation();
    const [deleteMobileBannerMutation, { isLoading: isMobileBannerLoading }] =
        useDeleteMobileBannerMutation();
    const [
        deleteFeaturedBannerMutation,
        { isLoading: isFeaturedBannerLoading }
    ] = useDeleteFeaturedBannerMutation();

    // === delete banner api function ===
    const deleteBanner = async (t: any) => {
        try {
            if (type === 'MOBILE') {
                const res: any = await deleteMobileBannerMutation({
                    banner_id: banner?._id
                });
                if (res?.data?.success) {
                    toast.success('Banner deleted!');
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message || 'Failed to delete banner!'
                    );
                }
            } else if (type === 'DESKTOP') {
                const res: any = await deleteBannerMutation({
                    banner_id: banner?._id
                });
                if (res?.data?.success) {
                    toast.success('Banner deleted!');
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message || 'Failed to delete banner!'
                    );
                }
            } else {
                const res: any = await deleteFeaturedBannerMutation({
                    banner_id: banner?._id
                });
                if (res?.data?.success) {
                    toast.success('Banner deleted!');
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message || 'Failed to delete banner!'
                    );
                }
            }
        } catch (error: any) {
            console.log('FAILED TO DELETE BANNER ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            }
        } finally {
            toast.dismiss(t);
        }
    };

    // === delete banner toast ===
    const handleDeleteBanner = () => {
        // show toast alert
        toast.custom(
            (t) => (
                <div className='overflow-hidden rounded-lg bg-none'>
                    <div className='flex w-full flex-col gap-4 rounded-lg border bg-background p-4 font-sans shadow-2xl sm:w-[356px]'>
                        <h1 className='flex flex-col items-center gap-2 text-sm font-medium'>
                            <div className='mx-auto grid size-9 place-items-center rounded-full bg-destructive/10'>
                                <Trash className='size-5 text-destructive' />
                            </div>
                            Are you sure want to delete this
                        </h1>
                        <div className='ms-auto flex w-fit items-center gap-2'>
                            <Button
                                onClick={() => toast.dismiss(t)}
                                size='sm'
                                variant='outline'
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => deleteBanner(t)}
                                size='sm'
                                variant='destructive'
                                disabled={
                                    isLoading ||
                                    isMobileBannerLoading ||
                                    isFeaturedBannerLoading
                                }
                            >
                                {isLoading || isMobileBannerLoading ? (
                                    <>
                                        <Loader className='animate-spin' />{' '}
                                        Deleting
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            ),
            {
                duration: 600000
            }
        );
    };
    return (
        <div className='relative h-full max-h-[300px] rounded-lg border bg-background p-2'>
            <Image
                src={getImgFullUrl(banner?.banner_url)}
                alt='Banner Image'
                width={720}
                height={360}
                className='h-full rounded-md object-contain'
            />

            <Button
                onClick={handleDeleteBanner}
                className='absolute top-4 right-4 hover:text-destructive'
                variant='outline'
                size='icon'
            >
                <Trash />
            </Button>
        </div>
    );
};

export default BannerCard;
