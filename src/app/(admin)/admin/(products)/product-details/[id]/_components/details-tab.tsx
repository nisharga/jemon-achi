import React, { useState } from 'react';
import {
    Package,
    Warehouse,
    MapPin,
    Tag,
    AlertCircle,
    CheckCircle,
    XCircle,
    Truck,
    Shield,
    Settings
} from 'lucide-react';
import { TProduct } from '@/admin/types/product';
import { TInventory } from '@/admin/types/product';
import { cn } from '@/admin/lib/utils';

const formatPrice = (price: number) => {
    return price > 0 ? `৳${price.toLocaleString()}` : 'Not Set';
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

const getStockStatus = (quantity: number) => {
    if (quantity === 0)
        return {
            status: 'Out of Stock',
            color: 'text-red-600 bg-red-50',
            icon: XCircle
        };
    if (quantity < 10)
        return {
            status: 'Low Stock',
            color: 'text-yellow-600 bg-yellow-50',
            icon: AlertCircle
        };
    return {
        status: 'In Stock',
        color: 'text-emerald-600 bg-emerald-50',
        icon: CheckCircle
    };
};

const DetailsTab = ({
    product,
    inventories
}: {
    product: TProduct;
    inventories: TInventory[];
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className='overflow-hidden rounded-lg bg-background shadow-md lg:col-span-2'>
            <div className='border-b'>
                <nav className='grid grid-cols-3'>
                    {[
                        { id: 'overview', label: 'Overview', icon: Package },
                        {
                            id: 'inventory',
                            label: 'Inventory',
                            icon: Warehouse
                        },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors lg:px-6 ${
                                    activeTab === tab.id
                                        ? 'border-yellow-500 bg-yellow-50 text-yellow-500'
                                        : 'border-transparent bg-secondary/20'
                                }`}
                            >
                                <Icon className='h-4 w-4' />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className='p-4 lg:p-6'>
                {activeTab === 'overview' && (
                    <div className='space-y-6'>
                        {/* Basic Information */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-semibold'>
                                Basic Information
                            </h3>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Product Name
                                        </label>
                                        <p className='font-medium'>
                                            {product?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Slug
                                        </label>
                                        <p className='font-mono text-sm'>
                                            {product?.slug}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Category
                                        </label>
                                        <p className=''>
                                            {product?.category?.name_en}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Subcategory
                                        </label>
                                        <p className=''>
                                            {product?.subcategory?.name_en}
                                        </p>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Min Order Quantity
                                        </label>
                                        <p className=''>
                                            {product?.min_order_qty}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Max Order Quantity
                                        </label>
                                        <p className=''>
                                            {product?.max_order_qty}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Created
                                        </label>
                                        <p className='text-sm'>
                                            {formatDate(product?.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className='text-sm text-muted-foreground'>
                                            Last Updated
                                        </label>
                                        <p className='text-sm'>
                                            {formatDate(product?.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-semibold'>
                                Description
                            </h3>
                            <div className='prose max-w-none rounded-lg bg-secondary p-4'>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: product?.description
                                    }}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-semibold'>Tags</h3>
                            <div className='space-y-2'>
                                <div>
                                    <label className='text-sm text-muted-foreground'>
                                        Search Tags
                                    </label>
                                    <div className='flex flex-wrap gap-2'>
                                        {product?.search_tags &&
                                            product?.search_tags?.map(
                                                (tag, index) => (
                                                    <span
                                                        key={index}
                                                        className='flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm text-yellow-800'
                                                    >
                                                        <Tag className='h-3 w-3' />
                                                        {tag}
                                                    </span>
                                                )
                                            )}
                                    </div>
                                </div>
                                {product?.offer_tags &&
                                    product?.offer_tags.length > 0 && (
                                        <div>
                                            <label className='text-sm text-muted-foreground'>
                                                Offer Tags
                                            </label>
                                            <div className='flex flex-wrap gap-2'>
                                                {product.offer_tags.map(
                                                    (tag, index) => (
                                                        <span
                                                            key={index}
                                                            className='flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800'
                                                        >
                                                            <Tag className='h-3 w-3' />
                                                            {tag}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                Inventory Management
                            </h3>
                        </div>

                        {inventories?.map((inventory: TInventory) => (
                            <div
                                key={inventory?._id}
                                className='rounded-lg border p-4 lg:p-6'
                            >
                                {/* Warehouse Info */}
                                <div className='flex items-start justify-between gap-2 border-b pb-6'>
                                    <div className='flex w-full flex-col items-start gap-2'>
                                        <div
                                            className={cn(
                                                'rounded-md p-2',
                                                {
                                                    'bg-yellow-50 text-yellow-600':
                                                        inventory?.warehouse
                                                            ?.type ===
                                                        'WAREHOUSE'
                                                },
                                                {
                                                    'bg-emerald-50 text-emerald-600':
                                                        inventory?.outlet
                                                            ?.type === 'OUTLET'
                                                }
                                            )}
                                        >
                                            <Warehouse className='size-5' />
                                        </div>
                                        <div>
                                            <h4 className='font-semibold capitalize'>
                                                {/* warehouse name */}
                                                {!inventory.outlet?.name &&
                                                    inventory.warehouse?.name}

                                                {/* outlet name */}
                                                {!inventory.warehouse?.name &&
                                                    inventory.outlet?.name}
                                            </h4>
                                            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                <div className='flex items-center gap-1'>
                                                    <MapPin className='h-3 w-3' />

                                                    {/* warehouse */}
                                                    <>
                                                        {!inventory?.outlet
                                                            ?.name &&
                                                            inventory?.warehouse
                                                                ?.name && (
                                                                <span className='capitalize'>
                                                                    {`${inventory?.warehouse?.address?.district} ${inventory?.warehouse?.address?.division}`}
                                                                </span>
                                                            )}
                                                    </>
                                                    {/* outlet */}
                                                    <>
                                                        {!inventory?.warehouse
                                                            ?.name &&
                                                            inventory?.outlet
                                                                ?.name && (
                                                                <span className='capitalize'>
                                                                    {`${inventory?.outlet?.address?.district} ${inventory?.outlet?.address?.division}`}
                                                                </span>
                                                            )}
                                                    </>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='rounded border bg-secondary/50 px-2 py-1 text-sm font-medium text-muted-foreground'>
                                        {inventory?.warehouse?.type && (
                                            <span className='text-yellow-500'>
                                                {inventory?.warehouse?.type}
                                            </span>
                                        )}
                                        {inventory?.outlet?.type && (
                                            <span className='text-emerald-600'>
                                                {inventory?.outlet?.type}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Variants Table */}
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='border-b'>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    Variant
                                                </th>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    SKU
                                                </th>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    Regular Price
                                                </th>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    Sale Price
                                                </th>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    Stock
                                                </th>
                                                <th className='px-4 py-3 text-left font-medium'>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventory?.variants?.map(
                                                (variant) => {
                                                    const stockStatus =
                                                        getStockStatus(0);
                                                    const StatusIcon =
                                                        stockStatus.icon;

                                                    return (
                                                        <tr
                                                            key={variant._id}
                                                            className='border-b'
                                                        >
                                                            <td className='px-4 py-3'>
                                                                <div className='flex flex-wrap gap-1'>
                                                                    {Object.entries(
                                                                        variant?.attribute_values ||
                                                                            {}
                                                                    ).map(
                                                                        ([
                                                                            key,
                                                                            value
                                                                        ]) => (
                                                                            <span
                                                                                key={
                                                                                    key
                                                                                }
                                                                                className='rounded px-2 py-1 text-xs'
                                                                            >
                                                                                {
                                                                                    key
                                                                                }

                                                                                :{' '}
                                                                                {
                                                                                    value
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className='px-4 py-3 font-mono text-sm'>
                                                                {variant?.sku}
                                                            </td>
                                                            <td className='px-4 py-3'>
                                                                {formatPrice(
                                                                    variant?.regular_price
                                                                )}
                                                            </td>
                                                            <td className='px-4 py-3'>
                                                                <div className='flex items-center gap-2'>
                                                                    {formatPrice(
                                                                        variant?.sale_price
                                                                    )}
                                                                    {variant?.sale_price >
                                                                        0 &&
                                                                        variant?.regular_price >
                                                                            variant?.sale_price && (
                                                                            <span className='w-fit shrink-0 rounded bg-red-100 px-1 py-0.5 text-xs text-destructive'>
                                                                                {Math.round(
                                                                                    ((variant?.regular_price -
                                                                                        variant?.sale_price) /
                                                                                        variant?.regular_price) *
                                                                                        100
                                                                                )}

                                                                                %
                                                                                OFF
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </td>
                                                            <td className='px-4 py-3 text-center font-semibold'>
                                                                {/* {variant?.available_quantity} */}{' '}
                                                                0
                                                            </td>
                                                            <td className='px-4 py-3'>
                                                                <span
                                                                    className={`flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-nowrap ${stockStatus?.color}`}
                                                                >
                                                                    <StatusIcon className='h-3 w-3 shrink-0' />
                                                                    {
                                                                        stockStatus?.status
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {inventories?.length <= 0 && (
                            <div className='py-10 text-center text-sm font-medium'>
                                No Inventory Found!
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className='space-y-6'>
                        <h3 className='text-lg font-semibold'>
                            Product Settings
                        </h3>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Shipping & Delivery */}
                            <div className='space-y-4'>
                                <h4 className='flex items-center gap-2 font-medium'>
                                    <Truck className='h-4 w-4' />
                                    Shipping & Delivery
                                </h4>
                                <div className='space-y-3 pl-6'>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Free Delivery:
                                        </span>
                                        <span
                                            className={`text-sm font-medium ${
                                                product?.is_free_delivery
                                                    ? 'text-emerald-600'
                                                    : 'text-destructive'
                                            }`}
                                        >
                                            {product?.is_free_delivery
                                                ? 'Yes'
                                                : 'No'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Shipping Cost:
                                        </span>
                                        <span className='text-sm font-medium'>
                                            {formatPrice(
                                                product?.shipping_cost as number
                                            )}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Cost Per Unit:
                                        </span>
                                        <span className='text-sm font-medium'>
                                            {formatPrice(
                                                product?.shipping_cost_per_unit as number
                                            )}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Delivery Time:
                                        </span>
                                        <span className='text-sm font-medium'>
                                            {
                                                product?.approximately_delivery_time
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Policies */}
                            <div className='space-y-4'>
                                <h4 className='flex items-center gap-2 text-sm font-medium'>
                                    <Shield className='h-4 w-4' />
                                    Policies
                                </h4>
                                <div className='space-y-3 pl-6'>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Warranty:
                                        </span>
                                        <span className='text-sm font-medium'>
                                            {product?.warranty ||
                                                'Not specified'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Return Policy:
                                        </span>
                                        <span className='text-sm font-medium'>
                                            {product?.return_policy
                                                ? typeof product.return_policy ===
                                                  'string'
                                                    ? product.return_policy
                                                    : product.return_policy
                                                          .title ||
                                                      'Not specified'
                                                : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-muted-foreground'>
                                            Coins Per Order:
                                        </span>
                                        <span className='font-medium'>
                                            {product?.coin_per_order}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsTab;
