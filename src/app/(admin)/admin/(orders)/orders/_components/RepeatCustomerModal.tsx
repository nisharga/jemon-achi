'use client';

import { Button } from '@/components/ui/admin-button';
import { Badge } from '@/components/ui/admin-badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { useGetSingleRepeatCustomerByPhoneNumberQuery } from '@/redux/admin/api/repeat-customer-api';
import {
    User,
    Phone,
    CheckCircle,
    Repeat,
    Package,
    UserPlus
} from 'lucide-react';

// Define TypeScript interfaces based on your data structure
interface ProductVariant {
    sku?: string;
    id?: string | null;
}

interface Product {
    id?: string | null;
    selected_variant?: ProductVariant;
}

interface Order {
    _id: string;
    products: Product[];
    status: string;
    order_serial_id: number;
    total_amount: number;
    COD?: number;
    paid_amount?: number;
    createdAt: string;
    [key: string]: unknown;
}

interface RepeatCustomerData {
    _id: string;
    customer_name: string | null;
    customer_phone: string;
    is_repeat_customer: boolean;
    orders: Order[];
}

interface RepeatCustomerModalProps {
    phoneNumber: string;
    customerName?: string;
    orderId?: string;
}

export const RepeatCustomerModal = ({
    phoneNumber,
    customerName
}: RepeatCustomerModalProps) => {
    const { data, isLoading, error } =
        useGetSingleRepeatCustomerByPhoneNumberQuery(
            { phone_number: phoneNumber },
            { skip: !phoneNumber }
        );

    const customerData: RepeatCustomerData | undefined = data?.data;
    const isRepeat = customerData?.is_repeat_customer || false;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2 text-xs hover:bg-gray-100'
                >
                    {isRepeat && (
                        <div className='flex items-center gap-1'>
                            <Repeat className='h-3 w-3 text-blue-500' />
                            <span className='text-blue-600'>Repeat</span>
                        </div>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className='max-h-[80vh] overflow-y-scroll sm:max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-xl'>
                        <User className='h-5 w-5' />
                        Customer Details
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500' />
                    </div>
                ) : error ? (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <p className='text-sm text-red-700'>
                            Error loading customer data
                        </p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {/* Customer Summary Card */}
                        <div className='rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5'>
                            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                                <div className='flex items-center gap-4'>
                                    <div className='rounded-full bg-white p-3 shadow-sm'>
                                        <User className='h-8 w-8 text-blue-600' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-bold text-gray-800'>
                                            {customerData?.customer_name ||
                                                customerName ||
                                                'N/A'}
                                        </h3>
                                        <p className='mt-1 flex items-center gap-2 text-gray-600'>
                                            <Phone className='h-4 w-4' />
                                            {phoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <Badge
                                        variant={
                                            isRepeat ? 'default' : 'secondary'
                                        }
                                        className='px-3 py-1 text-sm'
                                    >
                                        {isRepeat ? (
                                            <span className='flex items-center gap-1'>
                                                <CheckCircle className='h-3 w-3' />
                                                Repeat Customer
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1'>
                                                <UserPlus className='h-3 w-3' />
                                                New Customer
                                            </span>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Order Statistics */}
                        {customerData?.orders &&
                            customerData.orders.length > 0 && (
                                <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                                        <p className='mb-1 text-xs text-gray-500'>
                                            Total Orders
                                        </p>
                                        <p className='text-2xl font-bold text-gray-800'>
                                            {customerData.orders.length}
                                        </p>
                                    </div>

                                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                                        <p className='mb-1 text-xs text-gray-500'>
                                            Total Spend
                                        </p>
                                        <p className='text-2xl font-bold text-gray-800'>
                                            ৳
                                            {customerData.orders
                                                .reduce(
                                                    (
                                                        sum: number,
                                                        order: Order
                                                    ) =>
                                                        sum +
                                                        (order.total_amount ||
                                                            0),
                                                    0
                                                )
                                                .toLocaleString()}
                                        </p>
                                    </div>

                                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                                        <p className='mb-1 text-xs text-gray-500'>
                                            COD Total
                                        </p>
                                        <p className='text-2xl font-bold text-gray-800'>
                                            ৳
                                            {customerData.orders
                                                .reduce(
                                                    (
                                                        sum: number,
                                                        order: Order
                                                    ) => sum + (order.COD || 0),
                                                    0
                                                )
                                                .toLocaleString()}
                                        </p>
                                    </div>

                                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                                        <p className='mb-1 text-xs text-gray-500'>
                                            Paid Amount
                                        </p>
                                        <p className='text-2xl font-bold text-gray-800'>
                                            ৳
                                            {customerData.orders
                                                .reduce(
                                                    (
                                                        sum: number,
                                                        order: Order
                                                    ) =>
                                                        sum +
                                                        (order.paid_amount ||
                                                            0),
                                                    0
                                                )
                                                .toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                        {/* Order History */}
                        {customerData?.orders &&
                            customerData.orders.length > 0 && (
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
                                            <Package className='h-5 w-5' />
                                            Order History (
                                            {customerData.orders.length})
                                        </h3>
                                        <Badge
                                            variant='outline'
                                            className='text-xs'
                                        >
                                            Most Recent First
                                        </Badge>
                                    </div>

                                    <div className='space-y-3'>
                                        {customerData.orders.map(
                                            (order: Order) => {
                                                const totalItems =
                                                    order.products?.length || 0;
                                                const orderDate = new Date(
                                                    order.createdAt
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });

                                                return (
                                                    <div
                                                        key={order._id}
                                                        className='rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'
                                                    >
                                                        <div className='mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-center'>
                                                            <div>
                                                                <div className='flex items-center gap-3'>
                                                                    <span className='text-sm font-medium text-gray-700'>
                                                                        Order #
                                                                        {
                                                                            order.order_serial_id
                                                                        }
                                                                    </span>
                                                                    <Badge
                                                                        variant={
                                                                            order.status ===
                                                                            'COMPLETED'
                                                                                ? 'default'
                                                                                : order.status ===
                                                                                    'INCOMPLETE'
                                                                                  ? 'secondary'
                                                                                  : 'outline'
                                                                        }
                                                                        className='text-xs'
                                                                    >
                                                                        {
                                                                            order.status
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                                <p className='mt-1 text-xs text-gray-500'>
                                                                    {orderDate}
                                                                </p>
                                                            </div>

                                                            <div className='flex items-center gap-4'>
                                                                <div className='text-right'>
                                                                    <p className='text-sm text-gray-500'>
                                                                        Total
                                                                    </p>
                                                                    <p className='text-lg font-bold text-gray-800'>
                                                                        ৳
                                                                        {(
                                                                            order.total_amount ||
                                                                            0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Details */}
                                                        <div className='mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 md:grid-cols-4'>
                                                            <div>
                                                                <p className='text-xs text-gray-500'>
                                                                    COD
                                                                </p>
                                                                <p className='text-sm font-medium text-gray-800'>
                                                                    ৳
                                                                    {(
                                                                        order.COD ||
                                                                        0
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className='text-xs text-gray-500'>
                                                                    Paid
                                                                </p>
                                                                <p className='text-sm font-medium text-gray-800'>
                                                                    ৳
                                                                    {(
                                                                        order.paid_amount ||
                                                                        0
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className='text-xs text-gray-500'>
                                                                    Items
                                                                </p>
                                                                <p className='text-sm font-medium text-gray-800'>
                                                                    {totalItems}{' '}
                                                                    {totalItems ===
                                                                    1
                                                                        ? 'item'
                                                                        : 'items'}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className='text-xs text-gray-500'>
                                                                    Balance
                                                                </p>
                                                                <p className='text-sm font-medium text-gray-800'>
                                                                    ৳
                                                                    {(
                                                                        (order.total_amount ||
                                                                            0) -
                                                                        (order.paid_amount ||
                                                                            0)
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        {order.products &&
                                                            order.products
                                                                .length > 0 && (
                                                                <div className='mt-3 border-t border-gray-100 pt-3'>
                                                                    <p className='mb-2 text-xs font-medium text-gray-600'>
                                                                        Products:
                                                                    </p>
                                                                    <div className='space-y-2'>
                                                                        {order.products.map(
                                                                            (
                                                                                product: Product,
                                                                                pIndex: number
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        pIndex
                                                                                    }
                                                                                    className='flex items-center justify-between text-sm'
                                                                                >
                                                                                    <div className='flex items-center gap-2'>
                                                                                        <span className='text-gray-800'>
                                                                                            {product
                                                                                                .selected_variant
                                                                                                ?.sku ||
                                                                                                'N/A'}
                                                                                        </span>
                                                                                    </div>
                                                                                    {product
                                                                                        .selected_variant
                                                                                        ?.sku && (
                                                                                        <Badge
                                                                                            variant='outline'
                                                                                            className='text-xs'
                                                                                        >
                                                                                            SKU:{' '}
                                                                                            {
                                                                                                product
                                                                                                    .selected_variant
                                                                                                    .sku
                                                                                            }
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Summary Card */}
                        <div className='rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100 p-4'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-700'>
                                        {isRepeat
                                            ? 'Loyal Customer'
                                            : 'New Customer'}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {isRepeat
                                            ? `Has made ${
                                                  customerData?.orders
                                                      ?.length || 0
                                              } purchases with us`
                                            : 'First time ordering from our store'}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-xs text-gray-500'>
                                        Customer Since
                                    </p>
                                    <p className='text-sm font-medium text-gray-800'>
                                        {customerData?.orders &&
                                        customerData.orders.length > 0
                                            ? new Date(
                                                  customerData.orders[
                                                      customerData.orders
                                                          .length - 1
                                                  ].createdAt
                                              ).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'short'
                                              })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
