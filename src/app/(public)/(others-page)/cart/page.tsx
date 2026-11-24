'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    ShoppingCart,
    Package,
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    CreditCard,
    Truck,
    Info
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/shop/components/ui/card';
import { Button } from '@/shop/components/ui/button';
import { Badge } from '@/shop/components/ui/badge';
import { Input } from '@/shop/components/ui/input';
import { Separator } from '@/shop/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/shop/redux/store';
import {
    removeItem,
    selectCartItems,
    updateQty
} from '@/shop/redux/features/cart-slice';
import { Container } from '@/shop/components/common/container';
import { Skeleton } from '@/shop/components/ui/skeleton';
import Image from 'next/image';
import {
    useGetProductByIdsQuery,
    useGetStockByProductVariantQuery
} from '@/shop/redux/api/product-api';
import { computeAvailableFromStockPayload } from '@/shop/components/product/computeAvailableFromStockPayload';
import { skipToken } from '@reduxjs/toolkit/query';

import { getMediaUrl } from '@/shop/lib/get-media-url';
import { sendGTMEvent } from '@next/third-parties/google';
import { trackMetaFromGtmEvent } from '@/shop/lib/meta-pixel';
import { useGetCmsOfferQuery } from '@/shop/redux/api/offer';
import { calculateDiscountedPrice } from '@/shop/lib/offerHelper';

type ApiVariant = {
    _id: string;
    attributes?: string[];
    attribute_values?: Record<string, string>;
    regular_price?: number;
    sale_price?: number;
    sku?: string;
    barcode?: string;
    product?:
        | string
        | { _id: string; name?: string; slug?: string; thumbnail?: string };
};

type ApiProduct = {
    _id: string;
    name: string;
    slug?: string;
    thumbnail?: string;
    variants?: ApiVariant[];
    shipping_cost?: number;
    shipping_cost_per_unit?: number;
    is_free_delivery?: boolean;
    coin_per_order?: number;
};

type CartItemView = {
    id: string;
    _id?: string;
    product: {
        _id: string;
        name: string;
        thumbnail?: string | null;
        sku?: string;
    };
    variant: ApiVariant;
    attributes: Record<string, string>;
    quantity: number;
    unitPrice: number;
    maxQuantity?: number; // Maximum quantity based on stock availability
};

// 1. Create a sub-component to handle the hook for each individual item
const StockItemWrapper: React.FC<{
    item: CartItemView;
    children: (itemWithStock: CartItemView) => React.ReactNode;
}> = ({ item, children }) => {
    const productId = item.product._id;
    const variantId = item.variant?._id;

    // Hook is now called at the top level of this sub-component
    const { data: stockData } = useGetStockByProductVariantQuery(
        productId && variantId ? { productId, variantId } : skipToken
    );

    const itemWithStock = useMemo(() => {
        const totalAvailable = computeAvailableFromStockPayload(stockData);
        return {
            ...item,
            maxQuantity: totalAvailable > 0 ? totalAvailable : undefined
        };
    }, [item, stockData]);

    return <>{children(itemWithStock)}</>;
};

// 2. The Refactored Provider
const StockDataProvider: React.FC<{
    items: CartItemView[];
    children: (itemsWithStock: CartItemView[]) => React.ReactNode;
}> = ({ items = [], children }) => {
    // Default to empty array to prevent .length errors

    // Recursive or iterative accumulation usually gets messy with hooks,
    // so we use a simple approach: if no items, just render children.
    if (items.length === 0) {
        return <>{children([])}</>;
    }

    // To maintain hook order, we map the items to the Wrapper component
    // This allows each item to "own" its own hook call.
    return (
        <StockItemAccumulator
            items={items}
            results={[]}
            index={0}
            callback={children}
        />
    );
};

// Internal helper to collect results from all wrappers
const StockItemAccumulator: React.FC<{
    items: CartItemView[];
    results: CartItemView[];
    index: number;
    callback: (items: CartItemView[]) => React.ReactNode;
}> = ({ items, results, index, callback }) => {
    if (index === items.length) {
        return <>{callback(results)}</>;
    }

    return (
        <StockItemWrapper item={items[index]}>
            {(itemWithStock) => (
                <StockItemAccumulator
                    items={items}
                    results={[...results, itemWithStock]}
                    index={index + 1}
                    callback={callback}
                />
            )}
        </StockItemWrapper>
    );
};

const CartSummary: React.FC<{
    itemCount: number;
    totalPrice: number;
    isFetching?: boolean;
    formatGTMItems: any;
}> = ({ itemCount, totalPrice, isFetching, formatGTMItems }) => {
    const shipping = 0;
    const finalTotal = totalPrice + shipping;

    const handleCheckout = () => {
        const ecommerce = {
            currency: 'BDT',
            value: finalTotal,
            items: formatGTMItems()
        };

        sendGTMEvent?.({ event: 'begin_checkout', ecommerce });
        trackMetaFromGtmEvent('begin_checkout', ecommerce);
    };

    return (
        <Card className='sticky top-20 border-gray-200 shadow-none'>
            <CardHeader className='pb-4'>
                <CardTitle className='base-medium flex items-center gap-2 font-normal text-gray-800'>
                    <ShoppingBag className='text-tertiary h-5 w-5' />
                    <span>Order Summary</span>
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                        <span className='base-normal text-gray-600'>
                            Items ({itemCount})
                        </span>
                        <span className='base-normal'>
                            Tk {totalPrice.toFixed(2)}{' '}
                            {isFetching ? '(updating…)' : ''}
                        </span>
                    </div>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                    <span className='base-normal'>Total</span>
                    <span className='base-normal text-tertiary'>
                        Tk {finalTotal.toFixed(2)}
                    </span>
                </div>

                <div className='space-y-2 pt-2'>
                    <Link href='/checkout'>
                        <Button
                            className='lg-medium bg-tertiary hover:bg-tertiary/90 w-full py-3 text-xs text-white'
                            size='lg'
                            onClick={handleCheckout}
                        >
                            <CreditCard className='mr-2 h-5 w-5' />
                            Proceed to Checkout
                        </Button>
                    </Link>

                    <Link href='/'>
                        <Button
                            variant='outline'
                            className='lg-medium border-tertiary text-tertiary hover:bg-tertiary mt-3 w-full bg-transparent text-xs shadow-none hover:text-white'
                            size='lg'
                        >
                            <Truck className='mr-2 h-5 w-5' />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

const CartPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const lines = useAppSelector(selectCartItems);
    console.log('lines: ', lines);

    // ======================= 1. All cart item ids get ==============================
    const productIds = useMemo(
        () => Array.from(new Set(lines?.map((l: any) => l?.product?._id))),
        [lines]
    );

    // ======= 2. db all products using cart item id, then collect unique ids =======
    const {
        data: productsRes,
        isLoading,
        isFetching,
        isError
    } = useGetProductByIdsQuery(
        { product_ids: productIds },
        { skip: productIds.length === 0 }
    );

    console.log('productIds', productIds);
    console.log('productsRes:', productsRes?.data);

    const productMap = useMemo(() => {
        const arr = (productsRes as any)?.data ?? [];
        const map = new Map<string, any>();
        for (const p of arr) map.set(p._id, p);
        return map;
    }, [productsRes]);

    console.log('productsRes', productMap);

    // ====================================================================
    // ======= redux toolkit product id compare to live product id  =======
    // ======= then product variant id massing with state id   ============
    // ======= if not matching then more item from redux state  ===========
    // ====================================================================

    useEffect(() => {
        if (!productsRes || productIds.length === 0) return;
        const toRemove: string[] = [];

        for (const line of lines) {
            // @ts-ignore
            const product = productMap?.get(line?.product?._id);
            console.log('productMap: ', productMap);

            if (!product) {
                toRemove.push(line?.id);
                continue;
            }
            const variant = (product?.variants || [])?.find(
                (v: any) => v._id === line?.variantId
            );
            if (!variant) toRemove.push(line?.id);
        }

        if (toRemove.length > 0) {
            toast.error('Some items are no longer available.');
            toRemove.forEach((id) => console.log(id));
            // FIX: dispatch(removeItem(id)) takes string ID, not object
            toRemove.forEach((id) => dispatch(removeItem(id)));
        }
    }, [productsRes, productIds.length, lines, productMap, dispatch]);

    // ====================================================================
    // ======= active product variant find  =======
    // ======= activeProductVariants_id === line?.variantId   ============
    // ======= then unit price collect from it, and product details  ===========
    // ====================================================================

    /* const viewItems: CartItemView[] = useMemo(() => {
    const out: CartItemView[] = [];
    for (const line of lines) {
      // @ts-ignore
      const p = productMap.get(line?.product?._id);
      console.log("p: ", p);
      const pSubCategory = p?.subcategory;

      // Fallback to local snapshot if API hasn't loaded yet so UI isn't blank
      const activeProduct = p || line.product;

      const v = (activeProduct.variants || [])?.find(
        (vv: any) => vv._id === line?.variantId,
      );
      const vRegularPrice = v?.regular_price;

      // Price logic: API Sale > API Reg > Local Snapshot > 0
      const unitPrice = Number(
        v?.sale_price ?? v?.regular_price ?? line.priceSnapshot ?? 0,
      );

      out.push({
        id: line?.id,
        product: {
          _id: activeProduct._id,
          name: activeProduct.name,
          thumbnail: activeProduct.thumbnail || activeProduct.image,
        },
        variant: v,
        attributes: {
          Size: line.selectedSize?.toString() || "",
          Color: line.selectedColor || "",
          ...(v?.attribute_values || {}),
        },
        quantity: line.quantity,
        unitPrice,
        // Stock availability will be added in the StockDataProvider component
      });
    }
    return out;
  }, [lines, productMap]); */

    const { data: offerData } = useGetCmsOfferQuery({});
    const offer = offerData?.data;

    const viewItems: CartItemView[] = useMemo(() => {
        const out: CartItemView[] = [];

        for (const line of lines) {
            // @ts-ignore
            const p = productMap.get(line?.product?._id);
            const activeProduct = p || line.product;

            const v = (activeProduct?.variants || [])?.find(
                (vv: any) => vv._id === line?.variantId
            );

            // 1. Identify the different price points
            const regularPrice = Number(
                v?.regular_price ?? line.priceSnapshot ?? 0
            );
            const standardSellPrice = Number(v?.sale_price ?? regularPrice);

            // 2. Calculate the Special Offer price based on Regular Price
            const specialOfferPrice = calculateDiscountedPrice(
                activeProduct,
                regularPrice,
                offer
            );

            /**
             * 3. Determine Final Unit Price:
             * If the specialOfferPrice is lower than the regularPrice, it means the offer was applied.
             * Otherwise, we fall back to the standard sellPrice.
             */
            const finalUnitPrice =
                specialOfferPrice < regularPrice
                    ? specialOfferPrice
                    : standardSellPrice;

            out.push({
                id: line?.id,
                product: {
                    _id: activeProduct?._id,
                    name: activeProduct?.name,
                    thumbnail: activeProduct?.thumbnail || activeProduct?.image
                },
                variant: v,
                attributes: {
                    Size: line.selectedSize?.toString() || '',
                    Color: line.selectedColor || '',
                    ...(v?.attribute_values || {})
                },
                quantity: line.quantity,
                unitPrice: finalUnitPrice
            });
        }
        return out;
    }, [lines, productMap, offer]);

    const totalPrice = useMemo(
        () =>
            viewItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
        [viewItems]
    );

    // Optional: Google cart Manager

    const formatGTMItems = () => {
        return lines?.map((it: any) => ({
            item_id: it?.product?._id || it?.product?.slug || it?.id, // Fallback to id
            item_name: it.product?.name || it.name || '',
            item_category: it.product?.category?.name_en || '',
            // GA4 expects 'item_variant' for things like Size/Color
            item_variant:
                [it.selectedSize, it.selectedColor].filter(Boolean).join('/') ||
                'Default',
            price: Number(it.unitPrice || it.priceSnapshot) || 0,
            quantity: Number(it.quantity) || 1
        }));
    };

    const isEmpty = lines?.length === 0;

    return (
        <div className='min-h-screen bg-gray-50/50'>
            <div className='border-b bg-transparent py-6'>
                <Container>
                    <div className='mx-auto flex max-w-6xl items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <ShoppingCart className='text-tertiary h-6 w-6' />
                            <h1 className='lg-medium'>
                                <span className='text-tertiary'>Shopping</span>{' '}
                                Cart
                            </h1>
                        </div>
                        <div className='sm-medium text-tertiary rounded-full bg-white px-3 py-1'>
                            {lines.length}{' '}
                            {lines.length === 1 ? 'item' : 'items'}
                        </div>
                    </div>
                </Container>
            </div>

            <Container className='py-8'>
                <div className='mx-auto max-w-6xl'>
                    {isError && (
                        <div className='mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-[10px] text-red-700'>
                            <Info className='h-4 w-4' />
                            Real-time stock validation failed. Showing cached
                            cart data.
                        </div>
                    )}

                    {isLoading ? (
                        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                            <div className='space-y-4 lg:col-span-2'>
                                {[1, 2]?.map((i) => (
                                    <Skeleton
                                        key={i}
                                        className='h-40 w-full rounded-xl'
                                    />
                                ))}
                            </div>
                            <Skeleton className='h-80 w-full rounded-xl' />
                        </div>
                    ) : isEmpty ? (
                        <div className='rounded-2xl border border-dashed bg-white py-20 text-center'>
                            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary'>
                                <Package className='text-tertiary h-10 w-10' />
                            </div>
                            <h2 className='mb-2 text-base font-normal text-gray-900'>
                                Your cart is empty
                            </h2>
                            <p className='mx-auto mb-8 max-w-xs text-gray-600'>
                                Add some items to your cart to see them here.
                            </p>
                            <Link href='/'>
                                <Button className='bg-tertiary hover:bg-tertiary/90 px-10 text-white'>
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                            <div className='lg:col-span-2'>
                                <div className='space-y-4'>
                                    <div className='mb-2 flex items-center justify-between'>
                                        <h2 className='base-normal'>
                                            Review Items
                                        </h2>
                                        {isFetching && (
                                            <span className='text-tertiary animate-pulse text-[10px]'>
                                                Syncing prices...
                                            </span>
                                        )}
                                    </div>

                                    <StockDataProvider items={viewItems}>
                                        {(itemsWithStock) =>
                                            itemsWithStock?.map((item) => (
                                                <CartItemComponent
                                                    key={item?.id}
                                                    item={item}
                                                    onUpdateQty={(id, q) =>
                                                        dispatch(
                                                            updateQty({
                                                                id,
                                                                quantity: q
                                                            })
                                                        )
                                                    }
                                                    onRemove={(id) => {
                                                        dispatch(
                                                            removeItem(id)
                                                        ); // FIX: Direct ID string
                                                        toast.success(
                                                            'Removed from cart'
                                                        );
                                                    }}
                                                />
                                            ))
                                        }
                                    </StockDataProvider>
                                </div>
                            </div>

                            <div className='lg:col-span-1'>
                                <CartSummary
                                    itemCount={viewItems.length}
                                    totalPrice={totalPrice}
                                    formatGTMItems={formatGTMItems}
                                    isFetching={isFetching}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default CartPage;

const CartItemComponent: React.FC<{
    item: CartItemView;
    onUpdateQty: (id: string, q: number) => void;
    onRemove: (id: string) => void;
}> = ({ item, onUpdateQty, onRemove }) => {
    console.log('item: ', item);
    const [quantity, setQuantity] = useState(item.quantity);
    const [draftQty, setDraftQty] = useState(String(item.quantity));
    const regularPrice = item?.variant?.regular_price;

    useEffect(() => {
        setQuantity(item.quantity);
        setDraftQty(String(item.quantity));
    }, [item.quantity]);

    const priceEach = item.unitPrice;
    const subtotal = useMemo(() => priceEach * quantity, [priceEach, quantity]);

    const commitQuantity = (newQuantity: number) => {
        const q = Number.isNaN(newQuantity) ? 1 : Math.max(1, newQuantity);

        // Check if new quantity exceeds available stock
        if (item.maxQuantity && q > item.maxQuantity) {
            toast.error(`Only ${item.maxQuantity} items available in stock`);
            setDraftQty(String(quantity));
            return;
        }

        if (q === quantity) {
            setDraftQty(String(quantity));
            return;
        }
        onUpdateQty(item?.id, q);
        setQuantity(q);
        setDraftQty(String(q));
        toast.success('Item quantity updated.');
    };

    const increment = () => {
        const newQuantity = quantity + 1;
        // Check if increment exceeds available stock
        if (item.maxQuantity && newQuantity > item.maxQuantity) {
            toast.error(`Only ${item.maxQuantity} items available in stock`);
            return;
        }
        commitQuantity(newQuantity);
    };
    const decrement = () => commitQuantity(quantity - 1);

    const onInputChange = (value: string) =>
        setDraftQty(value.replace(/\D+/g, ''));
    const onInputBlur = () => commitQuantity(parseInt(draftQty || '1', 10));
    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
    };

    const title =
        item?.product?.name || `Item • ${item?.product?._id.slice(-6)}`;

    return (
        <Card className='group relative rounded-2xl border border-gray-200 bg-white shadow-none transition-shadow hover:shadow-md'>
            <CardContent className='px-4 py-3 md:px-5 md:py-0'>
                <div className='grid grid-cols-[88px_1fr_auto] items-start gap-4 sm:grid-cols-[104px_1fr_auto]'>
                    <div className='relative aspect-square w-22 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200 sm:w-26'>
                        <Image
                            src={getMediaUrl(item?.product?.thumbnail)}
                            alt={title}
                            width={208}
                            height={208}
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                    </div>

                    <div className='min-w-0 space-y-2'>
                        <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                                <h3 className='lg-medium line-clamp-2'>
                                    {title}
                                </h3>
                                {item.variant?.sku && (
                                    <p className='xs-normal mt-0.5 text-gray-600'>
                                        SKU: {item.variant.sku}
                                    </p>
                                )}
                            </div>

                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => onRemove(item?.id)}
                                aria-label='Remove item'
                                className='h-9 w-9 shrink-0 text-gray-600 hover:text-red-600'
                            >
                                <Trash2 className='sm-semibold h-4 w-4' />
                            </Button>
                        </div>

                        {!!item.attributes &&
                            Object.keys(item.attributes).length > 0 && (
                                <div className='flex flex-wrap gap-1.5'>
                                    {Object.entries(item.attributes)?.map(
                                        ([key, value]) => {
                                            // 1. Skip rendering if value is blank/null/undefined
                                            if (
                                                !value ||
                                                String(value).trim() === ''
                                            )
                                                return null;

                                            // 2. Specific Console Logs
                                            const lowerKey = key.toLowerCase();
                                            if (
                                                lowerKey === 'size' ||
                                                lowerKey === 'color'
                                            ) {
                                                console.log(`${key}:`, value);
                                            }

                                            return (
                                                <Badge
                                                    key={key}
                                                    variant='outline'
                                                    className='sm-normal border-tertiary text-tertiary rounded-md'
                                                >
                                                    <span className='mr-1 text-gray-600 uppercase'>
                                                        {key}:
                                                    </span>
                                                    {String(value)}
                                                </Badge>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                        {/* Price & Qty */}
                        <div className='flex flex-wrap items-center justify-between gap-3 pt-1.5'>
                            <div className='flex items-baseline gap-2'>
                                {/* Current Price */}
                                <span className='lg-medium text-tertiary'>
                                    Tk {priceEach.toFixed(2)}
                                </span>

                                {/* Old/Regular Price with Cross-through */}
                                {regularPrice && priceEach < regularPrice && (
                                    <span className='xs-normal text-gray-600 line-through'>
                                        Tk {regularPrice.toFixed(2)}
                                    </span>
                                )}

                                {/* Unit Label */}
                                <span className='xs-normal text-primary-ink'>
                                    each
                                </span>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={decrement}
                                    disabled={quantity <= 1}
                                    className='border-tertiary text-tertiary hover:bg-tertiary size-7 rounded-lg hover:text-white'
                                    aria-label='Decrease quantity'
                                >
                                    <Minus className='h-4 w-4' />
                                </Button>

                                <Input
                                    inputMode='numeric'
                                    pattern='[0-9]*'
                                    value={draftQty}
                                    onChange={(e) =>
                                        onInputChange(e.target.value)
                                    }
                                    onBlur={onInputBlur}
                                    onKeyDown={onInputKeyDown}
                                    className='border-tertiary focus-visible:ring-tertiary h-7 w-12 [appearance:textfield] rounded-lg text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                    aria-label='Quantity'
                                />

                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={increment}
                                    disabled={
                                        item.maxQuantity
                                            ? quantity >= item.maxQuantity
                                            : false
                                    }
                                    className='border-tertiary text-tertiary hover:bg-tertiary size-7 rounded-lg hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                                    aria-label='Increase quantity'
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>

                        {/* Subtotal */}
                        <div className='mt-2 flex items-center justify-between border-t pt-3'>
                            <span className='text-base text-gray-600'>
                                Subtotal
                            </span>
                            <span className='text-tertiary text-base font-normal sm:text-lg'>
                                Tk {subtotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
