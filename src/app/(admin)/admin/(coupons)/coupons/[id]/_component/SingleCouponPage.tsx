'use client';

import { useGetSingleCouponByIdQuery } from '@/admin/redux/api-queries/coupon-api';
import React from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
    CalendarDays,
    Tag,
    Settings,
    CheckCircle2,
    XCircle,
    Layers,
    ShoppingCart
} from 'lucide-react';
import { Badge } from '@/admin/components/ui/badge';
import { Separator } from '@/admin/components/ui/separator';

const SingleCouponPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { data, isLoading } = useGetSingleCouponByIdQuery(id);
    const coupon = data?.data;

    if (isLoading)
        return (
            <div className='flex min-h-[400px] items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
            </div>
        );

    if (!coupon)
        return (
            <div className='p-6 text-center text-muted-foreground'>
                Coupon not found.
            </div>
        );

    return (
        <div className='mx-auto space-y-2 sm:space-y-6'>
            {/* Header Section */}
            <div className='flex flex-col items-start justify-between gap-4 rounded-lg border border-secondary bg-background p-6 md:flex-row md:items-center'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-xl font-medium tracking-wider uppercase'>
                            {coupon.code}
                        </h1>
                        <Badge
                            variant={coupon.isActive ? 'default' : 'secondary'}
                            className='rounded-full'
                        >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <div
                        className='prose prose-sm max-w-none text-sm text-muted-foreground'
                        dangerouslySetInnerHTML={{ __html: coupon.description }}
                    />
                </div>
                <div className='text-right'>
                    <p className='text-2xl font-medium text-primary'>
                        {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : `৳${coupon.discountValue}`}
                        <span className='mt-1 block text-xs font-normal text-muted-foreground'>
                            OFF DISCOUNT
                        </span>
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Left Column: Constraints & Usage */}
                <div className='space-y-6 md:col-span-2'>
                    <div className='overflow-hidden rounded-lg border border-secondary bg-background'>
                        <div className='border-b border-secondary bg-secondary/30 px-4 py-2'>
                            <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase'>
                                <Settings className='size-4' /> Usage
                                Constraints
                            </p>
                        </div>
                        <div className='grid grid-cols-2 gap-x-8 gap-y-4 p-4'>
                            <InfoItem
                                label='Min Order Amount'
                                value={`৳${coupon.minOrderAmount}`}
                            />
                            <InfoItem
                                label='Max Discount'
                                value={`৳${coupon.maxDiscountAmount}`}
                            />
                            <InfoItem
                                label='Usage Limit'
                                value={`${coupon.usedCount} / ${coupon.usageLimit}`}
                            />
                            <InfoItem
                                label='Per User Limit'
                                value={coupon.usagePerUser}
                            />
                            <InfoItem
                                label='First Order Only'
                                value={coupon.firstOrderOnly ? 'Yes' : 'No'}
                                icon={
                                    coupon.firstOrderOnly ? (
                                        <CheckCircle2 className='size-3 text-primary' />
                                    ) : (
                                        <XCircle className='size-3 text-muted-foreground' />
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className='overflow-hidden rounded-lg border border-secondary bg-background'>
                        <div className='border-b border-secondary bg-secondary/30 px-4 py-2'>
                            <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase'>
                                <Layers className='size-4' /> Applicable
                                Relations
                            </p>
                        </div>
                        <div className='space-y-4 p-4'>
                            <RelationList
                                label='Categories'
                                items={coupon.categoryIds}
                                color='bg-primary/10'
                            />
                            <RelationList
                                label='Sub Categories'
                                items={coupon.subcategoryIds}
                            />
                            <RelationList
                                label='Sub-Sub Categories'
                                items={coupon.sub_subcategoryIds}
                            />
                            <Separator className='bg-secondary' />
                            <RelationList
                                label='Specific Products'
                                items={coupon.productIds}
                                icon={<ShoppingCart className='size-3' />}
                            />
                            <RelationList
                                label='Variants'
                                items={coupon.variant}
                                icon={<Tag className='size-3' />}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Validity & Timeline */}
                <div className='space-y-6'>
                    <div className='overflow-hidden rounded-lg border border-secondary bg-background'>
                        <div className='border-b border-secondary bg-secondary/30 px-4 py-2'>
                            <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase'>
                                <CalendarDays className='size-4' /> Validity
                                Period
                            </p>
                        </div>
                        <div className='space-y-4 p-4'>
                            <div>
                                <p className='text-xs font-medium text-muted-foreground uppercase'>
                                    Starts From
                                </p>
                                <p className='text-sm font-medium'>
                                    {format(new Date(coupon.startAt), 'PPP p')}
                                </p>
                            </div>
                            <Separator className='bg-secondary' />
                            <div>
                                <p className='text-xs font-medium text-muted-foreground uppercase'>
                                    Expires On
                                </p>
                                <p className='text-sm font-medium'>
                                    {format(new Date(coupon.expireAt), 'PPP p')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-lg border border-secondary bg-background p-4 text-center'>
                        <p className='mb-2 text-xs font-medium text-muted-foreground uppercase'>
                            Internal Metadata
                        </p>
                        <div className='flex justify-between text-sm text-muted-foreground'>
                            <span>
                                Created:{' '}
                                {format(new Date(coupon.createdAt), 'dd/MM/yy')}
                            </span>
                            <span>ID: {coupon._id.slice(-6)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InfoItem = ({
    label,
    value,
    icon
}: {
    label: string;
    value: any;
    icon?: React.ReactNode;
}) => (
    <div className='flex flex-col gap-0.5'>
        <p className='text-xs font-medium tracking-tight text-muted-foreground uppercase'>
            {label}
        </p>
        <div className='flex items-center gap-1.5'>
            {icon}
            <span className='text-sm font-medium'>{value}</span>
        </div>
    </div>
);

const RelationList = ({
    label,
    items,
    color = 'bg-secondary',
    icon
}: {
    label: string;
    items: string[];
    color?: string;
    icon?: React.ReactNode;
}) => (
    <div className='space-y-1.5'>
        <p className='text-xs font-medium text-muted-foreground uppercase'>
            {label}
        </p>
        <div className='flex flex-wrap gap-1.5'>
            {items && items.length > 0 ? (
                items.map((id) => (
                    <Badge
                        key={id}
                        variant='outline'
                        className={`border-secondary py-0 text-sm font-normal ${color} flex items-center gap-1`}
                    >
                        {icon}
                        {id.slice(-8)}
                    </Badge>
                ))
            ) : (
                <span className='text-sm text-muted-foreground/60 italic'>
                    All {label}
                </span>
            )}
        </div>
    </div>
);

export default SingleCouponPage;
