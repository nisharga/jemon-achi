'use client';

import useDebounce from '@/hooks/use-debounce';
import {
    useEditOrderMutation,
    useGetSingleOrderByIdQuery
} from '@/redux/admin/api/order-api';
import { useGetAllSearchVariantsQuery } from '@/redux/admin/api/product-api';
import { TOrder } from '@/types/admin/order';
import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Loader, Minus, Plus, X } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useUploadMultipleFileToAWSMutation } from '@/redux/admin/api/file-upload-api';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { cn, getImgFullUrl } from '@/lib/admin-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import BackBtn from '@/components/shared/back-btn';
import { FraudData } from '@/redux/admin/api/fraudApi';
import FraudListModal from '@/components/shared/FraudListModal';

const EditOrderForm = ({ id }: { id: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.ORDER_UPDATE]
    });

    // === router ===
    const router = useRouter();

    // === get single order ===
    const { data, isLoading: isGetSingleOrderLoading } =
        useGetSingleOrderByIdQuery({ order_id: id });
    const order: TOrder = data?.data;

    // Form
    const form = useForm({
        defaultValues: {
            customerName: '',
            customerPhone: '',
            division: '',
            district: '',
            thana: '',
            address: '',
            orderNote: '',
            deliveryCharge: 0,
            advance: 0,
            paymentType: 'CASH_ON_DELIVERY',
            overallDiscountType: 'FLAT',
            overallDiscountAmount: 0
        }
    });

    // States
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);

    // === advance payment proof (optional) ===
    const [senderNumber, setSenderNumber] = useState('');
    const [trxId, setTrxId] = useState('');
    const [existingProofFiles, setExistingProofFiles] = useState<string[]>([]);
    const [paymentFiles, setPaymentFiles] = useState<File[]>([]);
    const [uploadMultipleFiles, { isLoading: isUploadingProof }] =
        useUploadMultipleFileToAWSMutation();

    const handleProofFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setPaymentFiles((prev) => [...prev, ...files]);
        }
        e.target.value = '';
    };

    const removeProofFile = (index: number) => {
        setPaymentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingProofFile = (index: number) => {
        setExistingProofFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const debouncedSearch = useDebounce(searchQuery);

    // === get all search variants ===
    const {
        data: searchVariantsData,
        isLoading: isSearchProductLoading,
        isFetching: isSearchProductFetching
    } = useGetAllSearchVariantsQuery({
        page: 1,
        limit: 20,
        searchQuery: debouncedSearch,
        barcode: '',
        product_id: ''
    });
    const searchVariants = searchVariantsData?.data?.data || [];

    // === edit order api mutation ===
    const [editOrder, { isLoading }] = useEditOrderMutation();

    // ================================================
    // ================== Fraud Checker ===============
    // ================================================
    const [fraudData, setFraudData] = useState<FraudData | null>(null);
    const [loading, setLoading] = useState(false);
    const updatePhoneNumber = form.watch('customerPhone');

    useEffect(() => {
        const fetchFraudData = async () => {
            if (!updatePhoneNumber) {
                return;
            }

            const phone = updatePhoneNumber.replace(/\D/g, '');
            if (Number(updatePhoneNumber) < 10) {
                return;
            }
            setLoading(true);

            try {
                const url = `/api/fraud-check?phone=${encodeURIComponent(phone)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiResponse = await response.json();
                const fraudInfo = apiResponse.data;
                setFraudData(fraudInfo || null);
            } catch (error) {
                console.error('Error fetching fraud data:', error);
                const errorData: FraudData = {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to fetch fraud data',
                    apis: false
                };
                setFraudData(errorData);
            } finally {
                setLoading(false);
            }
        };

        fetchFraudData();
    }, [updatePhoneNumber]);

    // Set default values
    useEffect(() => {
        if (order) {
            // === preserve any existing order-level (overall) discount ===
            // order.total_discount = sum(product total_discount) + overall discount.
            // Represent the existing overall portion as a FLAT amount so re-saving
            // keeps total_discount identical until the admin changes it.
            const productDiscountsTotal = (order?.products || []).reduce(
                (acc: number, p: any) => acc + (p.total_discount || 0),
                0
            );
            const existingOverallDiscount = Math.max(
                0,
                (order.total_discount || 0) - productDiscountsTotal
            );

            form.reset({
                customerName: order.customer_name || '',
                customerPhone: order.customer_phone || '',
                division: order.delivery_address?.division || '',
                district: order.delivery_address?.district || '',
                thana: order.delivery_address?.thana || '',
                address: order.delivery_address?.address || '',
                orderNote: order?.order_note,
                deliveryCharge: order.delivery_charge || 0,
                advance: order.paid_amount || 0,
                paymentType: order.payment_type || 'CASH_ON_DELIVERY',
                overallDiscountType: 'FLAT',
                overallDiscountAmount: existingOverallDiscount
            });

            // === prefill existing advance payment proof (optional) ===
            setSenderNumber(order?.manual_payment_info?.sender_number || '');
            setTrxId(order?.manual_payment_info?.trxId || '');
            setExistingProofFiles(order?.manual_payment_info?.files || []);
            setPaymentFiles([]);

            const initialCart =
                order?.products?.map((p: any) => ({
                    product: p.product._id || p.product.id,
                    product_name: p.product.name,
                    total_quantity: p.total_quantity,
                    total_price: p.total_price,
                    discount_type: p.discount_type,
                    discount_amount: p.discount_amount,
                    total_discount: p.total_discount,
                    shipping_cost: p.shipping_cost,
                    shipping_cost_per_unit: p.shipping_cost_per_unit,
                    total_shipping_cost: p.total_shipping_cost,
                    is_free_delivery: p.is_free_delivery,
                    coin_per_order: p.coin_per_order,
                    selected_variant: {
                        _id: p.selected_variant._id,
                        attributes: [], // Assuming from variant if needed
                        attribute_values: p.selected_variant.attribute_values,
                        regular_price: p.selected_variant.regular_price,
                        sale_price: p.selected_variant.sale_price,
                        sku: p.selected_variant.sku,
                        barcode: p.selected_variant.barcode,
                        product: {
                            _id: p.product._id || p.product.id,
                            name: p.product.name,
                            slug: p.product.slug || '',
                            thumbnail: p.product.thumbnail || ''
                        }
                    }
                })) || [];
            setCart(initialCart);
        }
    }, [order, form]);

    // === loading state ===
    if (isGetSingleOrderLoading) {
        return <Loader className='mx-auto size-4 py-10' />;
    }

    // Calculate sub_total
    const subTotal = cart.reduce((acc, item) => acc + item.total_price, 0);
    // product-level (per-item) discounts
    const productDiscounts = cart.reduce(
        (acc, item) => acc + item.total_discount,
        0
    );
    const deliveryCharge = form.watch('deliveryCharge');

    // order-level (overall) discount — can be added/changed at any edit
    const overallDiscountType = form.watch('overallDiscountType');
    const overallDiscountAmount = form.watch('overallDiscountAmount') || 0;
    // mirror the backend: PERCENTAGE applies to (sub_total - product discounts)
    const overallDiscount =
        overallDiscountType === 'PERCENTAGE'
            ? (subTotal - productDiscounts) * (overallDiscountAmount / 100)
            : overallDiscountAmount;

    // total discount sent to the backend = product discounts + overall discount
    const discounts = productDiscounts + overallDiscount;

    const paymentType = form.watch('paymentType');
    const advancePayment = form.watch('advance') || 0;
    // Grand total of the order — mirrors the backend:
    // sub_total - total_discount + delivery_charge.
    // The advance is a payment TOWARD this total, not a reduction of it, so it
    // must not be subtracted here (sending total_amount: 0 fails validation).
    const totalAmount = subTotal - discounts + deliveryCharge;
    // Grand total shown to the admin — mirrors the create-order-form live
    // calculation: subtotal + delivery_charge - (discounts + paid/advance).
    // Display only; the backend still receives `totalAmount` (without the paid
    // amount subtracted) so validation/accounting stays correct.
    const grandTotal = subTotal + deliveryCharge - (discounts + advancePayment);
    // Amount still owed after the advance has been paid.
    const remaining = Math.max(0, totalAmount - advancePayment);
    const payableAmount =
        paymentType === 'FULL_PAYMENT' ? remaining : deliveryCharge;
    const cod = paymentType === 'FULL_PAYMENT' ? 0 : remaining;

    // Add to cart
    const addToCart = (variant: any) => {
        const product = variant.product;
        const salePrice = variant.sale_price;
        const regularPrice = variant.regular_price;
        const newQty = 1;
        const newTotalPrice = salePrice * newQty;
        const newTotalDiscount = calculateDiscount(
            {
                discount_type: 'PERCENTAGE',
                discount_amount: 0
            },
            newQty,
            regularPrice
        );
        const newTotalShipping = product.is_free_delivery
            ? 0
            : product.shipping_cost +
              (newQty - 1) * product.shipping_cost_per_unit;

        const newItem = {
            product: product.id || product._id,
            product_name: product.name,
            total_quantity: newQty,
            total_price: newTotalPrice,
            discount_type: 'PERCENTAGE',
            discount_amount: 0,
            total_discount: newTotalDiscount,
            shipping_cost: product.shipping_cost,
            shipping_cost_per_unit: product.shipping_cost_per_unit,
            total_shipping_cost: newTotalShipping,
            is_free_delivery: product.is_free_delivery,
            coin_per_order: product.coin_per_order,
            selected_variant: {
                _id: variant.id || variant._id,
                attributes: variant.attributes || [],
                attribute_values: variant.attribute_values,
                regular_price: variant.regular_price,
                sale_price: salePrice,
                sku: variant.sku,
                barcode: variant.barcode,
                product: {
                    _id: product.id || product._id,
                    name: product.name,
                    slug: product.slug || '',
                    thumbnail: product.thumbnail || ''
                }
            }
        };

        setCart((prev) => {
            const existingIndex = prev.findIndex(
                (item) =>
                    item.selected_variant._id === newItem.selected_variant._id
            );
            if (existingIndex !== -1) {
                const existing = prev[existingIndex];
                const updatedQty = existing.total_quantity + 1;
                const updatedTotalPrice = salePrice * updatedQty;
                const updatedTotalDiscount = calculateDiscount(
                    existing,
                    updatedQty,
                    regularPrice
                );
                const updatedTotalShipping = existing.is_free_delivery
                    ? 0
                    : existing.shipping_cost +
                      (updatedQty - 1) * existing.shipping_cost_per_unit;
                const updatedItem = {
                    ...existing,
                    total_quantity: updatedQty,
                    total_price: updatedTotalPrice,
                    total_discount: updatedTotalDiscount,
                    total_shipping_cost: updatedTotalShipping
                };
                return [
                    ...prev.slice(0, existingIndex),
                    updatedItem,
                    ...prev.slice(existingIndex + 1)
                ];
            } else {
                return [...prev, newItem];
            }
        });
    };

    // Update quantity
    const updateQuantity = (variantId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.selected_variant._id === variantId) {
                    const newQty = Math.max(1, item.total_quantity + delta);
                    const salePrice = item.selected_variant.sale_price;
                    const regularPrice = item.selected_variant.regular_price;
                    return {
                        ...item,
                        total_quantity: newQty,
                        total_price: salePrice * newQty,
                        total_discount: calculateDiscount(
                            item,
                            newQty,
                            regularPrice
                        ),
                        total_shipping_cost: item.is_free_delivery
                            ? 0
                            : item.shipping_cost +
                              (newQty - 1) * item.shipping_cost_per_unit
                    };
                }
                return item;
            })
        );
    };

    // Update discount type
    const updateDiscountType = (variantId: string, newType: string) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.selected_variant._id === variantId) {
                    const updatedItem = { ...item, discount_type: newType };
                    updatedItem.total_discount = calculateDiscount(
                        updatedItem,
                        updatedItem.total_quantity,
                        updatedItem.selected_variant.regular_price
                    );
                    return updatedItem;
                }
                return item;
            })
        );
    };

    // Update discount amount
    const updateDiscountAmount = (variantId: string, newAmount: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.selected_variant._id === variantId) {
                    const updatedItem = { ...item, discount_amount: newAmount };
                    updatedItem.total_discount = calculateDiscount(
                        updatedItem,
                        updatedItem.total_quantity,
                        updatedItem.selected_variant.regular_price
                    );
                    return updatedItem;
                }
                return item;
            })
        );
    };

    // Remove from cart
    const removeFromCart = (variantId: string) => {
        setCart((prev) =>
            prev.filter((item) => item.selected_variant._id !== variantId)
        );
    };

    // Calculate discount for item
    const calculateDiscount = (
        item: any,
        qty: number,
        regularPrice: number
    ) => {
        if (item.discount_type === 'PERCENTAGE') {
            return qty * regularPrice * (item.discount_amount / 100);
        } else {
            return item.discount_amount * qty;
        }
    };

    // Handle edit order
    const handleEditOrder = async (formData: any) => {
        const payload = {
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            payment_type: formData.paymentType,
            sub_total: subTotal,
            total_discount: discounts,
            overall_discount_amount: formData.overallDiscountAmount || 0,
            overall_discount_type: formData.overallDiscountType,
            delivery_charge: formData.deliveryCharge,
            total_amount: totalAmount,
            payable_amount: payableAmount,
            COD: cod,
            paid_amount: formData.advance || 0,
            products: cart?.map((item) => ({
                product: item.product,
                product_name: item.product_name,
                total_quantity: item.total_quantity,
                total_price: item.total_price,
                discount_type: item.discount_type,
                discount_amount: item.discount_amount,
                total_discount: item.total_discount,
                shipping_cost: item.shipping_cost,
                shipping_cost_per_unit: item.shipping_cost_per_unit,
                total_shipping_cost: item.total_shipping_cost,
                is_free_delivery: item.is_free_delivery,
                coin_per_order: item.coin_per_order,
                selected_variant: item.selected_variant
            })),
            // is_delivery_charge_paid: false,
            delivery_address: {
                division: formData.division,
                district: formData.district,
                thana: formData.thana,
                address: formData.address
            },
            order_note: formData?.orderNote
        };

        try {
            // === advance payment proof (optional) ===
            const hasProof =
                paymentFiles.length > 0 ||
                existingProofFiles.length > 0 ||
                senderNumber.trim() ||
                trxId.trim();
            if (hasProof) {
                let uploadedFiles: string[] = [];
                if (paymentFiles.length > 0) {
                    const uploadRes: any =
                        await uploadMultipleFiles(paymentFiles);
                    if (uploadRes?.data?.success) {
                        uploadedFiles = uploadRes?.data?.data?.urls || [];
                    } else {
                        toast.error('Payment proof upload failed!');
                        return;
                    }
                }
                (payload as any).manual_payment_info = {
                    sender_number: senderNumber.trim() || undefined,
                    trxId: trxId.trim() || undefined,
                    paid_amount: Number(formData.advance || 0),
                    files: [...existingProofFiles, ...uploadedFiles]
                };
            }

            const res: any = await editOrder({ order_id: order?._id, payload });
            if (res?.data?.success) {
                toast.success('Order edited!');
                router.replace('/admin/orders');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to edit order!'
                );
            }
        } catch (error: any) {
            console.log('EDIT ORDER ERROR: ', error);

            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Something went wrong! Try again.');
            }
        }
    };

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='space-y-6'>
            <div className='flex items-center gap-2'>
                <BackBtn />
                <h1 className='text-lg font-medium'>Edit Order</h1>
            </div>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Left Side */}
                <div className='flex flex-col gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'>
                    <Input
                        placeholder='Search by sku...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full'
                    />
                    <div className='max-h-[400px] overflow-auto rounded-md border p-2 shadow'>
                        {isSearchProductLoading || isSearchProductFetching ? (
                            <div className='flex h-full w-full items-center justify-center'>
                                <Loader className='mx-auto size-4 animate-spin' />
                            </div>
                        ) : (
                            searchVariants?.map(
                                (variant: any, index: number) => {
                                    return (
                                        <div
                                            key={variant?._id}
                                            className={cn(
                                                'flex items-center justify-between border-b py-2',
                                                {
                                                    'border-none':
                                                        index ===
                                                        searchVariants?.length -
                                                            1
                                                }
                                            )}
                                        >
                                            <div className='space-y-2'>
                                                <div className='flex gap-2'>
                                                    <Image
                                                        src={
                                                            getImgFullUrl(
                                                                variant?.product
                                                                    ?.thumbnail
                                                            ) ??
                                                            'https://placehold.co/100x100/png'
                                                        }
                                                        alt={
                                                            variant?.product
                                                                ?.name
                                                        }
                                                        className='size-10 rounded object-cover'
                                                        height={100}
                                                        width={100}
                                                    />
                                                    <span className='flex flex-col gap-1'>
                                                        <p className='text-sm font-medium'>
                                                            {
                                                                variant?.product
                                                                    ?.name
                                                            }{' '}
                                                            - ({variant?.sku})
                                                        </p>
                                                        <p className='text-xs'>
                                                            {Object?.entries(
                                                                variant?.attribute_values ||
                                                                    {}
                                                            )
                                                                ?.map(
                                                                    ([k, v]) =>
                                                                        `${k}: ${v}`
                                                                )
                                                                ?.join(', ')}
                                                        </p>
                                                        <p className='text-xs'>
                                                            Sale Price:{' '}
                                                            {
                                                                variant?.sale_price
                                                            }
                                                            , Regular Price:{' '}
                                                            {
                                                                variant?.regular_price
                                                            }
                                                        </p>
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant='outline'
                                                onClick={() =>
                                                    addToCart(variant)
                                                }
                                                className='size-7'
                                                size='icon'
                                            >
                                                <Plus className='size-4' />
                                            </Button>
                                        </div>
                                    );
                                }
                            )
                        )}
                    </div>

                    <div className='mt-6'>
                        <h3 className='font-bold'>Ordered Products</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className='text-right'>
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart?.map((item) => (
                                    <TableRow key={item?.selected_variant._id}>
                                        <TableCell className='text-sm'>
                                            <p className='max-w-60 text-wrap'>
                                                {item?.product_name} (
                                                {Object.entries(
                                                    item?.selected_variant
                                                        ?.attribute_values || {}
                                                )
                                                    .map(([, v]) => `${v}`)
                                                    .join(' - ')}
                                                )
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Select
                                                    value={item.discount_type}
                                                    onValueChange={(v) =>
                                                        updateDiscountType(
                                                            item
                                                                .selected_variant
                                                                ._id,
                                                            v
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className='w-24'>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='PERCENTAGE'>
                                                            Percentage
                                                        </SelectItem>
                                                        <SelectItem value='FLAT'>
                                                            Flat
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type='number'
                                                    value={item.discount_amount}
                                                    onChange={(e) =>
                                                        updateDiscountAmount(
                                                            item
                                                                .selected_variant
                                                                ._id,
                                                            +e.target.value
                                                        )
                                                    }
                                                    className='w-20'
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-4'>
                                                <Button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item
                                                                .selected_variant
                                                                ._id,
                                                            -1
                                                        )
                                                    }
                                                    size='icon'
                                                    variant='outline'
                                                    className='size-7'
                                                >
                                                    <Minus className='size-4' />
                                                </Button>
                                                <span>
                                                    {item.total_quantity}
                                                </span>
                                                <Button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item
                                                                .selected_variant
                                                                ._id,
                                                            1
                                                        )
                                                    }
                                                    size='icon'
                                                    variant='outline'
                                                    className='size-7'
                                                >
                                                    <Plus className='size-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.total_price}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.selected_variant
                                                            ._id
                                                    )
                                                }
                                                variant='destructive'
                                                size='sm'
                                                className='size-7'
                                            >
                                                <X className='size-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Right Side */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleEditOrder)}
                        className='flex flex-col gap-6 rounded-lg bg-background p-4 shadow-md lg:p-6'
                    >
                        <div className='relative grid gap-4 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='customerName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='customerPhone'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Phone *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {fraudData && (
                                <div className='absolute top-15 right-0 flex justify-end'>
                                    <FraudListModal
                                        fraudData={fraudData}
                                        loading={loading}
                                        className='!flex-row'
                                    />
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name='division'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Division *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='district'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>District *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='thana'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thana</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Local Address *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='orderNote'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order Note</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='paymentType'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select payment type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='CASH_ON_DELIVERY'>
                                                Cash on Delivery
                                            </SelectItem>
                                            <SelectItem value='FULL_PAYMENT'>
                                                Full Payment
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='deliveryCharge'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delivery Charge</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(+e.target.value)
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* <FormField
              control={form.control}
              name="advance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advance Payment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

                        <FormField
                            control={form.control}
                            name='advance'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Advance Payment</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            min='0'
                                            step='any'
                                            {...field}
                                            value={field.value || ''}
                                            onKeyDown={(e) => {
                                                // Prevent both minus and plus keys
                                                if (
                                                    e.key === '-' ||
                                                    e.key === '+' ||
                                                    e.key === 'Subtract' ||
                                                    e.key === 'Add'
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                // Remove any plus or minus signs that might have gotten through
                                                const cleanValue =
                                                    value.replace(/[+-]/g, '');

                                                // Parse the cleaned value
                                                const numValue =
                                                    cleanValue === ''
                                                        ? null
                                                        : parseFloat(
                                                              cleanValue
                                                          );
                                                field.onChange(numValue);
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* === order-level (overall) discount — add/change any time === */}
                        <FormItem>
                            <FormLabel>Discount</FormLabel>
                            <div className='flex items-center gap-2'>
                                <FormField
                                    control={form.control}
                                    name='overallDiscountType'
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className='w-32'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='PERCENTAGE'>
                                                    Percentage
                                                </SelectItem>
                                                <SelectItem value='FLAT'>
                                                    Flat
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='overallDiscountAmount'
                                    render={({ field }) => (
                                        <FormControl>
                                            <Input
                                                type='number'
                                                min='0'
                                                step='any'
                                                placeholder='0'
                                                {...field}
                                                value={field.value || ''}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === '-' ||
                                                        e.key === '+' ||
                                                        e.key === 'Subtract' ||
                                                        e.key === 'Add'
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const cleanValue =
                                                        e.target.value.replace(
                                                            /[+-]/g,
                                                            ''
                                                        );
                                                    field.onChange(
                                                        cleanValue === ''
                                                            ? 0
                                                            : parseFloat(
                                                                  cleanValue
                                                              )
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    )}
                                />
                            </div>
                        </FormItem>

                        {/* === advance payment proof (optional) === */}
                        <div className='space-y-3 border-t pt-4'>
                            <p className='text-sm font-medium'>
                                Advance Payment Proof{' '}
                                <span className='text-muted-foreground'>
                                    (Optional)
                                </span>
                            </p>
                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                <div className='space-y-1'>
                                    <label className='text-xs text-muted-foreground'>
                                        Sender Number
                                    </label>
                                    <Input
                                        placeholder='01XXXXXXXXX'
                                        value={senderNumber}
                                        onChange={(e) =>
                                            setSenderNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-xs text-muted-foreground'>
                                        Transaction ID
                                    </label>
                                    <Input
                                        placeholder='TrxID'
                                        value={trxId}
                                        onChange={(e) =>
                                            setTrxId(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <label className='flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm hover:bg-muted'>
                                    <ImagePlus className='size-4' />
                                    Upload Payment Screenshot
                                    <input
                                        type='file'
                                        accept='image/*'
                                        multiple
                                        className='hidden'
                                        onChange={handleProofFilesChange}
                                    />
                                </label>

                                {(existingProofFiles.length > 0 ||
                                    paymentFiles.length > 0) && (
                                    <div className='flex flex-wrap gap-2'>
                                        {existingProofFiles.map(
                                            (file, index) => (
                                                <div
                                                    key={`existing-${index}`}
                                                    className='relative size-20'
                                                >
                                                    <Image
                                                        src={getImgFullUrl(
                                                            file
                                                        )}
                                                        alt={`proof-${index}`}
                                                        width={80}
                                                        height={80}
                                                        className='size-20 rounded-md border object-cover'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            removeExistingProofFile(
                                                                index
                                                            )
                                                        }
                                                        className='absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white'
                                                    >
                                                        <X className='size-3' />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                        {paymentFiles.map((file, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className='relative size-20'
                                            >
                                                <Image
                                                    src={URL.createObjectURL(
                                                        file
                                                    )}
                                                    alt={`new-proof-${index}`}
                                                    width={80}
                                                    height={80}
                                                    className='size-20 rounded-md border object-cover'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        removeProofFile(index)
                                                    }
                                                    className='absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white'
                                                >
                                                    <X className='size-3' />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <div>
                                <strong>Sub Total:</strong> {subTotal}
                            </div>
                            <div>
                                <strong>Delivery Charge:</strong>{' '}
                                {deliveryCharge}
                            </div>
                            <div>
                                <strong>Product Discounts:</strong>{' '}
                                {productDiscounts}
                            </div>
                            <div>
                                <strong>Overall Discount:</strong>{' '}
                                {overallDiscount}
                            </div>
                            <div>
                                <strong>Total Discount:</strong> {discounts}
                            </div>
                            <div>
                                <strong>Advance:</strong> {advancePayment}
                            </div>
                            <div>
                                <strong>Grand Total:</strong> {grandTotal}
                            </div>
                        </div>
                        <Button
                            type='submit'
                            disabled={isLoading || isUploadingProof}
                        >
                            {isLoading || isUploadingProof ? (
                                <Loader className='mx-auto size-4 animate-spin' />
                            ) : (
                                `Save Changes (${grandTotal})`
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default EditOrderForm;
