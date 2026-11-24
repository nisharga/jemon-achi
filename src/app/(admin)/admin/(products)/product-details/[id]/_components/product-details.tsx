'use client';

import React from 'react';
import {
    Package,
    Star,
    TrendingUp,
    BarChart3,
    Tag,
    Truck,
    Shield,
    Calendar,
    Globe,
    ShoppingCart,
    Layers,
    FileText,
    Award,
    Eye,
    EyeOff,
    Edit3,
    Download,
    Share2
} from 'lucide-react';
import Image from 'next/image';
import { useGetSingleProductByIdForAdminViewQuery } from '@/redux/admin/api/product-api';
import { TProduct } from '@/types/admin/product';
import { TInventory } from '@/types/admin/product';
import { PermissionEnum } from '@/types/admin/permistion';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { getImgFullUrl } from '@/lib/admin-utils';

const ProductDetails = ({ id }: { id: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });

    // === get single product for admin view ===
    const { data } = useGetSingleProductByIdForAdminViewQuery({
        product_id: id
    });

    const product: TProduct = data?.data;
    const inventories = data?.data?.inventories;

    const getTotalInventory = () => {
        return (
            inventories?.reduce((total: number, inventory: TInventory) => {
                return (
                    total +
                    inventory?.variants?.reduce((variantTotal, variant) => {
                        return (
                            variantTotal + (variant?.available_quantity || 0)
                        );
                    }, 0)
                );
            }, 0) || 0
        );
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    // Component Sub-components
    const StatusBadge = ({ published }: { published: boolean }) => (
        <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                published
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-gray-200 bg-gray-100 text-gray-600'
            }`}
        >
            {published ? (
                <Eye className='h-4 w-4' />
            ) : (
                <EyeOff className='h-4 w-4' />
            )}
            {published ? 'Published' : 'Unpublished'}
        </div>
    );

    const StatCard = ({
        icon: Icon,
        label,
        value,
        color = 'blue'
    }: {
        icon: any;
        label: string;
        value: string | number;
        color?: string;
    }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            emerald: 'from-emerald-500 to-emerald-600',
            amber: 'from-amber-500 to-amber-600',
            purple: 'from-purple-500 to-purple-600'
        };

        return (
            <div className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='mb-1 text-sm font-medium text-gray-600'>
                            {label}
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                            {value}
                        </p>
                    </div>
                    <div
                        className={`rounded-lg bg-gradient-to-br p-3 ${
                            colorClasses[color as keyof typeof colorClasses]
                        }`}
                    >
                        <Icon className='h-6 w-6 text-white' />
                    </div>
                </div>
            </div>
        );
    };

    const InfoSection = ({
        title,
        icon: Icon,
        children,
        gradient = 'from-blue-500 to-blue-600'
    }: {
        title: string;
        icon: any;
        children: React.ReactNode;
        gradient?: string;
    }) => (
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
            <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
                <div className='flex items-center gap-3'>
                    <Icon className='h-5 w-5 text-white' />
                    <h3 className='text-lg font-semibold text-white'>
                        {title}
                    </h3>
                </div>
            </div>
            <div className='p-6'>{children}</div>
        </div>
    );

    const DetailRow = ({
        label,
        value,
        icon: Icon
    }: {
        label: string;
        value: string | number;
        icon?: any;
    }) => (
        <div className='flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0'>
            <div className='flex items-center gap-3'>
                {Icon && <Icon className='h-4 w-4 text-gray-400' />}
                <span className='text-sm font-medium text-gray-600'>
                    {label}
                </span>
            </div>
            <span className='text-sm font-semibold text-gray-900'>{value}</span>
        </div>
    );

    return (
        <div className='min-h-screen bg-gray-50/30 p-4 lg:p-6'>
            {/* Header with Actions */}
            <div className='mb-6'>
                <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                    <div>
                        <div className='mb-2 flex items-center gap-3'>
                            <h1 className='text-2xl font-bold text-gray-900 lg:text-3xl'>
                                {product?.name}
                            </h1>
                            <StatusBadge
                                published={product?.is_published || false}
                            />
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <button className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                            <Edit3 className='h-4 w-4' />
                            Edit
                        </button>
                        <button className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                            <Share2 className='h-4 w-4' />
                            Share
                        </button>
                        <button className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white transition-all hover:from-blue-600 hover:to-blue-700'>
                            <Download className='h-4 w-4' />
                            Export
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <StatCard
                        icon={TrendingUp}
                        label='Total Sold'
                        value={product?.total_sold || 0}
                        color='blue'
                    />
                    <StatCard
                        icon={Package}
                        label='Total Stock'
                        value={getTotalInventory()}
                        color='emerald'
                    />
                    <StatCard
                        icon={Star}
                        label='Average Rating'
                        value={product?.ratings?.average?.toFixed(1) || '0.0'}
                        color='amber'
                    />
                    <StatCard
                        icon={BarChart3}
                        label='Total Reviews'
                        value={product?.ratings?.total || 0}
                        color='purple'
                    />
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 xl:grid-cols-4'>
                {/* Left Column - Images */}
                <div className='space-y-6 xl:col-span-1'>
                    {/* Main Thumbnail */}
                    <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
                        <div className='border-b border-gray-100 p-4'>
                            <h3 className='flex items-center gap-2 font-semibold text-gray-900'>
                                <Award className='h-5 w-5 text-blue-600' />
                                Product Thumbnail
                            </h3>
                        </div>
                        <div className='p-4'>
                            <div className='aspect-square overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-100'>
                                <Image
                                    src={
                                        getImgFullUrl(product?.thumbnail) ||
                                        '/placeholder-image.png'
                                    }
                                    alt={product?.name || 'Product Image'}
                                    className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
                                    height={400}
                                    width={400}
                                    onError={(e) => {
                                        const target =
                                            e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.png';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gallery Images */}
                    {product?.slider_images &&
                        product.slider_images.length > 0 && (
                            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
                                <div className='border-b border-gray-100 p-4'>
                                    <h3 className='flex items-center gap-2 font-semibold text-gray-900'>
                                        <FileText className='h-5 w-5 text-purple-600' />
                                        Gallery Images (
                                        {product.slider_images.length})
                                    </h3>
                                </div>
                                <div className='p-4'>
                                    <div className='grid grid-cols-2 gap-3'>
                                        {product.slider_images.map(
                                            (image, index) => (
                                                <div
                                                    key={index}
                                                    className='aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-colors hover:border-blue-300'
                                                >
                                                    <Image
                                                        src={
                                                            getImgFullUrl(
                                                                image
                                                            ) ||
                                                            '/placeholder-image.png'
                                                        }
                                                        alt={`${product.name} image ${index + 1}`}
                                                        className='h-full w-full object-cover transition-transform duration-300 hover:scale-110'
                                                        height={150}
                                                        width={150}
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.src =
                                                                '/placeholder-image.png';
                                                        }}
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                </div>

                {/* Right Column - Details */}
                <div className='space-y-6 xl:col-span-3'>
                    {/* Basic Information */}
                    <InfoSection
                        title='Basic Information'
                        icon={FileText}
                        gradient='from-blue-500 to-blue-600'
                    >
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-3'>
                                <div className='flex items-center space-x-2'>
                                    <Tag className='h-5 w-5 text-blue-500' />
                                    <span className='w-32 font-semibold'>
                                        SKU:
                                    </span>
                                    <span>{product?.sku || '-'}</span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Globe className='h-5 w-5 text-green-500' />
                                    <span className='w-32 font-semibold'>
                                        Slug:
                                    </span>
                                    <span>{product?.slug || '-'}</span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <ShoppingCart className='h-5 w-5 text-yellow-500' />
                                    <span className='w-32 font-semibold'>
                                        Product Type:
                                    </span>
                                    <span>
                                        {product?.product_type || 'Standard'}
                                    </span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Layers className='h-5 w-5 text-purple-500' />
                                    <span className='w-32 font-semibold'>
                                        Category:
                                    </span>
                                    <span>
                                        {product?.category?.name || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className='space-y-3'>
                                <div className='flex items-center space-x-2'>
                                    <Layers className='h-5 w-5 text-purple-500' />
                                    <span className='w-32 font-semibold'>
                                        Subcategory:
                                    </span>
                                    <span>
                                        {product?.subcategory?.name || '-'}
                                    </span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Package className='h-5 w-5 text-orange-500' />
                                    <span className='w-32 font-semibold'>
                                        Min Order Qty:
                                    </span>
                                    <span>{product?.min_order_qty || '-'}</span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Package className='h-5 w-5 text-orange-500' />
                                    <span className='w-32 font-semibold'>
                                        Max Order Qty:
                                    </span>
                                    <span>{product?.max_order_qty || '-'}</span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Calendar className='h-5 w-5 text-red-500' />
                                    <span className='w-32 font-semibold'>
                                        Created Date:
                                    </span>
                                    <span>
                                        {formatDate(product?.createdAt) || '-'}
                                    </span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Calendar className='h-5 w-5 text-red-500' />
                                    <span className='w-32 font-semibold'>
                                        Last Updated:
                                    </span>
                                    <span>
                                        {formatDate(product?.updatedAt) || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </InfoSection>

                    {/* Inventory & Pricing */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <InfoSection
                            title='Inventory Overview'
                            icon={Package}
                            gradient='from-emerald-500 to-emerald-600'
                        >
                            <div className='space-y-1'>
                                <DetailRow
                                    label='Total Stock'
                                    value={getTotalInventory()}
                                    icon={Package}
                                />
                                <DetailRow
                                    label='Total Sold'
                                    value={product?.total_sold || 0}
                                    icon={TrendingUp}
                                />
                                <DetailRow
                                    label='Available Stock'
                                    value={
                                        getTotalInventory() -
                                        (product?.total_sold || 0)
                                    }
                                    icon={Package}
                                />
                                <DetailRow
                                    label='Stock Status'
                                    value={
                                        getTotalInventory() > 0
                                            ? 'In Stock'
                                            : 'Out of Stock'
                                    }
                                    icon={Package}
                                />
                            </div>
                        </InfoSection>

                        <InfoSection
                            title='Pricing & Costs'
                            icon={Tag}
                            gradient='from-amber-500 to-amber-600'
                        >
                            <div className='space-y-1'>
                                <DetailRow
                                    label='Coin per Order'
                                    value={product?.coin_per_order || 0}
                                    icon={Award}
                                />
                                <DetailRow
                                    label='Shipping Cost'
                                    value={`$${product?.shipping_cost || 0}`}
                                    icon={Truck}
                                />
                                <DetailRow
                                    label='Shipping per Unit'
                                    value={`$${product?.shipping_cost_per_unit || 0}`}
                                    icon={Truck}
                                />
                                <DetailRow
                                    label='Free Delivery'
                                    value={
                                        product?.is_free_delivery ? 'Yes' : 'No'
                                    }
                                    icon={Truck}
                                />
                            </div>
                        </InfoSection>
                    </div>

                    {/* Shipping & Policies */}
                    <InfoSection
                        title='Shipping & Policies'
                        icon={Shield}
                        gradient='from-purple-500 to-purple-600'
                    >
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <div className='flex items-center gap-4 rounded-lg bg-blue-50 p-3'>
                                    <Truck className='h-8 w-8 text-blue-600' />
                                    <div>
                                        <p className='font-medium text-blue-900'>
                                            Delivery Time
                                        </p>
                                        <p className='text-sm text-blue-700'>
                                            {product?.approximately_delivery_time ||
                                                'Not specified'}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4 rounded-lg bg-emerald-50 p-3'>
                                    <Tag className='h-8 w-8 text-emerald-600' />
                                    <div>
                                        <p className='font-medium text-emerald-900'>
                                            Free Delivery
                                        </p>
                                        <p className='text-sm text-emerald-700'>
                                            {product?.is_free_delivery
                                                ? 'Available'
                                                : 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div className='flex items-center gap-4 rounded-lg bg-orange-50 p-3'>
                                    <Shield className='h-8 w-8 text-orange-600' />
                                    <div>
                                        <p className='font-medium text-orange-900'>
                                            Warranty
                                        </p>
                                        <p className='text-sm text-orange-700'>
                                            {product?.warranty ||
                                                'No warranty provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4 rounded-lg bg-purple-50 p-3'>
                                    <Calendar className='h-8 w-8 text-purple-600' />
                                    <div>
                                        <p className='font-medium text-purple-900'>
                                            Pre-order
                                        </p>
                                        <p className='text-sm text-purple-700'>
                                            {product?.is_pre_order
                                                ? 'Available'
                                                : 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoSection>

                    {/* Description */}
                    {product?.description && (
                        <InfoSection
                            title='Product Description'
                            icon={FileText}
                            gradient='from-gray-600 to-gray-700'
                        >
                            <div
                                className='prose prose-sm max-w-none leading-relaxed text-gray-700'
                                dangerouslySetInnerHTML={{
                                    __html: product.description
                                }}
                            />
                        </InfoSection>
                    )}

                    {/* Tags & Channels */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Offer Tags */}
                        {product?.offer_tags &&
                            product.offer_tags.length > 0 && (
                                <InfoSection
                                    title='Offer Tags'
                                    icon={Award}
                                    gradient='from-pink-500 to-pink-600'
                                >
                                    <div className='flex flex-wrap gap-2'>
                                        {product.offer_tags.map(
                                            (tag, index) => (
                                                <span
                                                    key={index}
                                                    className='rounded-lg border border-pink-200 bg-gradient-to-r from-pink-50 to-pink-100 px-3 py-2 text-sm font-medium text-pink-700'
                                                >
                                                    {tag.replace(/_/g, ' ')}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </InfoSection>
                            )}

                        {/* Sales Channels */}
                        <InfoSection
                            title='Sales Channels'
                            icon={Globe}
                            gradient='from-indigo-500 to-indigo-600'
                        >
                            <div className='space-y-3'>
                                <div
                                    className={`flex items-center justify-between rounded-lg p-3 ${
                                        product?.sale_channels?.website
                                            ? 'border border-emerald-200 bg-emerald-50'
                                            : 'border border-gray-200 bg-gray-100'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                product?.sale_channels?.website
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                        <span className='font-medium text-gray-900'>
                                            Website
                                        </span>
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            product?.sale_channels?.website
                                                ? 'text-emerald-600'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {product?.sale_channels?.website
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>
                                <div
                                    className={`flex items-center justify-between rounded-lg p-3 ${
                                        product?.sale_channels?.pos
                                            ? 'border border-blue-200 bg-blue-50'
                                            : 'border border-gray-200 bg-gray-100'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                product?.sale_channels?.pos
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                        <span className='font-medium text-gray-900'>
                                            POS
                                        </span>
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            product?.sale_channels?.pos
                                                ? 'text-blue-600'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {product?.sale_channels?.pos
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </InfoSection>
                    </div>

                    {/* Ratings & Reviews */}
                    <InfoSection
                        title='Ratings & Reviews'
                        icon={Star}
                        gradient='from-amber-500 to-amber-600'
                    >
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='text-center'>
                                <div className='mb-2 flex items-center justify-center gap-2'>
                                    <span className='text-3xl font-bold text-gray-900'>
                                        {product?.ratings?.average?.toFixed(
                                            1
                                        ) || '0.0'}
                                    </span>
                                    <div className='flex'>
                                        {renderStars(
                                            product?.ratings?.average || 0
                                        )}
                                    </div>
                                </div>
                                <p className='text-sm text-gray-600'>
                                    Average Rating
                                </p>
                                <p className='text-xs text-gray-500'>
                                    {product?.ratings?.total || 0} total reviews
                                </p>
                            </div>
                            <div className='space-y-1'>
                                <DetailRow
                                    label='Total Ratings'
                                    value={product?.ratings?.total || 0}
                                    icon={Star}
                                />
                                <DetailRow
                                    label='Average Rating'
                                    value={
                                        product?.ratings?.average?.toFixed(1) ||
                                        '0.0'
                                    }
                                    icon={Star}
                                />
                                <DetailRow
                                    label='Rating Distribution'
                                    value='View Details'
                                    icon={BarChart3}
                                />
                            </div>
                        </div>
                    </InfoSection>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
