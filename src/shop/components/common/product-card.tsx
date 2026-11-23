'use client';
import Link from 'next/link';
import { CheckCircle, Coins, Flame, Info, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAppDispatch } from '@/shop/redux/store';
import { addToCart } from '@/shop/redux/features/cart-slice';
import { calculateDiscount, cn } from '@/shop/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import {
    useGetAllVariantByAProductQuery,
    useGetSingleProductByIdQuery,
    useGetStockByProductVariantQuery
} from '@/shop/redux/api/product-api';
import { useRouter } from 'next/navigation';
import { Variant } from '@/shop/types/product-detail';
import { ProductVariantSelector } from '@/shop/components/product/ProductVariantSelector';
import { skipToken } from '@reduxjs/toolkit/query';
import { ProductActionsBtn } from '@/shop/components/product/ProductActionsBtn';
import { computeAvailableFromStockPayload } from '@/shop/components/product/computeAvailableFromStockPayload';
import { getMediaUrl } from '@/shop/lib/get-media-url';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        brand: string; // Added brand for the requested feature
        price: number;
        discountPercentage?: number;
        stock?: number;
        rating?: number;
        thumbnail: string;
        approximately_delivery_time?: string;
        coin_per_order?: string;
        variants?: any;
    };
    onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: any) {
    // modal open-close logic
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ================= fetching ====================
    const name = product?.name || 'Product';
    const regular_price = product?.variants?.[0]?.regular_price || '0';
    const sell_price = product?.variants?.[0]?.sale_price || '0';

    return (
        <Link
            href={`/product/${product?.slug}`}
            className='mb-2 block'
            id='product-card'
            data-testid='product-card'
        >
            {/* PREMIUM CARD CONTAINER: ENTIRE CARD IS INTERACTIVE */}
            <div className='group h-full rounded-t-2xl rounded-b-sm bg-white transition-all duration-300 ease-in-out hover:shadow-lg'>
                {/* Section */}
                <div
                    className={cn(
                        'group relative flex flex-col overflow-hidden rounded-lg'
                    )}
                >
                    {/* <Batches
      offerTag={offerTag}
      regular_price={regular_price}
      sell_price={sell_price}
     /> */}

                    {/* Product Image */}
                    <ProductImage
                        thumb={product?.thumbnail}
                        name={product?.name}
                    />

                    {/* Product Name */}
                    <h3 className='mb-1 line-clamp-2 px-2 text-center text-[12px] font-medium text-gray-800 sm:mb-2 md:text-sm'>
                        {name}
                    </h3>

                    {/* Price Section */}
                    <div className='mb-1 flex items-center justify-center gap-1.5 px-2 sm:mb-2'>
                        <span className='text-[13px] font-medium text-black md:text-base'>
                            ৳ {sell_price}
                        </span>
                        <span className='text-[10px] text-gray-400 line-through md:text-[13px]'>
                            ৳{regular_price}
                        </span>
                    </div>

                    {/* <div className='flex gap-1 md:gap-2 px-2 mb-1 sm:mb-2 pb-1'>
      <button className='flex-1 bg-gradient-to-r from-primary/70 via-primary/90 to-primary hover:bg-primary text-white text-[9px] md:text-[11px] font-medium py-1.5 md:py-2 rounded transition-colors uppercase cursor-pointer'>
       View
      </button>

      <div
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
       }}>
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
         <button className='flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-[9px] md:text-[11px] font-medium py-1.5 md:py-2 rounded transition-colors uppercase cursor-pointer px-2'>
          Add to Cart
         </button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] p-0 overflow-hidden lg:mt-10'>
         <ProductQuickViewDetails product={product} setOpen={setIsModalOpen} />
        </DialogContent>
       </Dialog>
      </div>
     </div> */}
                </div>
            </div>
        </Link>
    );
}

interface IProps {
    offerTag: string;
    regular_price: string;
    sell_price: string;
}
const Batches = ({ offerTag, regular_price, sell_price }: IProps) => {
    return (
        <div className='flex items-start justify-between'>
            {regular_price && sell_price && (
                <span className='rounded-br-2xl bg-gradient-to-r from-primary/70 via-primary/90 to-primary p-1 px-4 py-1 text-[9px] font-medium text-white md:text-[11px]'>
                    {calculateDiscount(regular_price, sell_price)}
                </span>
            )}
            {offerTag && (
                <span
                    className={cn(
                        'flex items-center gap-0.5 rounded-bl-2xl bg-gradient-to-r from-primary/70 via-primary/90 to-primary p-1 !px-4 py-1 text-[9px] font-medium text-white md:text-[11px]'
                    )}
                >
                    <Flame className='h-2.5 w-2.5 shrink-0 fill-current md:h-3 md:w-3' />

                    {/* Mobile: Truncated (8 chars) */}
                    {offerTag && (
                        <span className='md:hidden'>
                            {offerTag?.length > 8
                                ? `${offerTag.substring(0, 8)}...`
                                : offerTag}
                        </span>
                    )}

                    {/* Desktop: Full Text */}
                    {offerTag && (
                        <span className='hidden md:block'>{offerTag}</span>
                    )}
                </span>
            )}
        </div>
    );
};

const ProductImage = ({ thumb, name }: any) => {
    return (
        <div className='relative my-1 flex aspect-square w-full items-center justify-center overflow-hidden sm:my-2'>
            <div
                className='transition-transform duration-300 ease-out group-hover:scale-110'
                // style={{ backgroundColor: "red" }}
            >
                <Image
                    src={getMediaUrl(thumb) || '/No_Image_Available.jpg'}
                    alt={name || 'Product image'}
                    width={800}
                    height={800}
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className='h-auto max-h-[200px] w-full lg:max-h-[620px]'
                />
            </div>
        </div>
    );
};

const ProductQuickViewDetails = ({ product, setOpen }: any) => {
    const slug = product?.slug;

    const { data, isLoading, error } = useGetSingleProductByIdQuery({
        product_id: slug
    });

    const productDetails = (data?.data?.product ?? null) as any | null;
    const productId = data?.data?.product?._id;

    const { data: variantsData, isLoading: variantsLoading } =
        useGetAllVariantByAProductQuery(
            { product_id: productId as string },
            { skip: !productId }
        );

    const variants = (variantsData?.data ?? null) as any | null;

    const productImages =
        productDetails?.slider_images?.map((url: string, index: number) => ({
            url,
            id: index.toString(),
            alt: `Product image ${index + 1}`
        })) || [];

    if (productDetails?.thumbnail) {
        productImages.unshift({
            url: productDetails.thumbnail,
            id: 'thumbnail',
            alt: 'Main product image'
        });
    }

    const dispatch = useAppDispatch();
    const router = useRouter();

    /* ----------------------------- UI State ------------------------------ */
    // const [selectedImage, setSelectedImage] = useState<number>(0);
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    /* const [selectedAttributes, setSelectedAttributes] = useState<
      Record<string, string>
    >({}); */
    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const [showAttrErrors, setShowAttrErrors] = useState(false);

    /* ----------------------------- Total Available ------------------------------ */
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >({});
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const effectiveVariant = selectedVariant || null;
    const { data: stockPayload, isLoading: stockLoading } =
        useGetStockByProductVariantQuery(
            productId && effectiveVariant?._id
                ? { productId: productId, variantId: effectiveVariant?._id }
                : skipToken
        );

    const totalAvailable = useMemo(
        () => computeAvailableFromStockPayload(stockPayload || undefined),
        [stockPayload]
    );

    const isInStock = totalAvailable > 0;

    /* -------------------- Variants & Attribute Options ------------------- */
    /* const variants: Variant[] = useMemo(
      () => productDetails?.variants ?? [],
      [productDetails?.variants]
    ); */

    // Pick current variant based on current attribute selections
    const currentVariant: Variant | undefined = useMemo(() => {
        if (!variants?.length) return undefined;
        // If selection is incomplete, try to match partially; fall back to first
        const match = variants?.find((v: any) =>
            Object.entries(selectedAttributes).every(
                ([k, val]) => v.attribute_values?.[k] === val
            )
        );
        return match ?? variants[0];
    }, [variants, selectedAttributes]);

    // 2. Derive Attribute Keys and Options from the API data
    const { attributeKeys, attributeOptions } = useMemo(() => {
        const keys = new Set<string>();
        const options: Record<string, Set<string>> = {};

        // FIXED: Iterate over 'variants' (from variantsData) instead of productDetails
        variants?.forEach((v: any) => {
            Object?.entries(v.attribute_values || {})?.forEach(
                ([key, value]) => {
                    keys.add(key);
                    if (!options[key]) options[key] = new Set();
                    options[key].add(value as string);
                }
            );
        });

        return {
            attributeKeys: Array.from(keys),
            attributeOptions: Object.fromEntries(
                Object.entries(options).map(([k, v]) => [k, Array.from(v)])
            )
        };
    }, [variants]); // Depend on variants

    // 4. Handle Selection
    const handleAttributeChange = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: value
        }));
        setShowAttrErrors(false);
    };

    // Initialize default selection to the first variant’s attributes (nice UX)
    useEffect(() => {
        if (variants?.length) {
            const first = variants[0];
            const init = first?.attribute_values ?? {};
            // only set once on initial load (or when variants list changes)
            setSelectedAttributes((prev) =>
                Object.keys(prev).length ? prev : init
            );
        }
    }, [variants]);

    useEffect(() => {
        if (!attributeKeys?.length) return;
        const next: Record<string, string> = {};
        attributeKeys?.forEach((k) => {
            const opts = attributeOptions?.[k] || [];
            if (opts?.length === 1) next[k] = opts?.[0] as string;
        });
        setSelectedAttributes((prev) => ({ ...next, ...prev }));
    }, [attributeKeys, attributeOptions]);

    useEffect(() => {
        if (!attributeKeys?.length) {
            setSelectedVariant(null);
            return;
        }
        const allSelected = attributeKeys?.every(
            (k) => !!selectedAttributes?.[k]
        );
        if (!allSelected) {
            setSelectedVariant(null);
            return;
        }
        const match = variants?.find((v: any) =>
            attributeKeys?.every(
                (k) => v?.attribute_values?.[k] === selectedAttributes?.[k]
            )
        );
        setSelectedVariant(match || null);
    }, [selectedAttributes, attributeKeys, variants]);

    // Quantity guards (no stock system per your note; still respect min/max if present)
    const minOrderQty = productDetails?.min_order_qty ?? 1;
    const maxOrderQty = productDetails?.max_order_qty ?? 10;
    useEffect(() => {
        setQuantity((q) => Math.min(Math.max(q, minOrderQty), maxOrderQty));
    }, [minOrderQty, maxOrderQty]);

    /* ----------------------------- Pricing ------------------------------- */
    // Use currentVariant (derived from variants matching selection)
    const regularPriceValue =
        currentVariant?.regular_price ?? variants?.[0]?.regular_price ?? 0;
    const salePriceValue =
        currentVariant?.sale_price ??
        variants?.[0]?.sale_price ??
        regularPriceValue;

    const discountPercentage =
        regularPriceValue > 0
            ? Math.round(
                  ((regularPriceValue - salePriceValue) / regularPriceValue) *
                      100
              )
            : 0;

    const requiredAttributes = Object.keys(attributeOptions);
    const isSelectionComplete =
        requiredAttributes.length === 0 ||
        requiredAttributes.every((attr) => !!selectedAttributes[attr]);

    /* ------------------- Actions: add to cart / buy now ------------------ */
    const validateBeforeAdd = (): boolean => {
        if (!productDetails?._id || !currentVariant?._id) {
            toast.error('Invalid product/variant');
            return false;
        }
        if (!isSelectionComplete) {
            toast.error('Please select all required options');
            return false;
        }
        if (quantity < minOrderQty) {
            toast.error(`Minimum order is ${minOrderQty}`);
            return false;
        }
        if (maxOrderQty && quantity > maxOrderQty) {
            toast.error(`Maximum order is ${maxOrderQty}`);
            return false;
        }
        return true;
    };

    const doAddToCart = async (): Promise<boolean> => {
        if (!validateBeforeAdd()) return false;

        try {
            setIsAdding(true);
            dispatch(
                addToCart({
                    // @ts-ignore: Unreachable code error
                    product: productDetails, // Pass the whole object
                    variantId: currentVariant!._id,
                    selectedSize: currentVariant?.attribute_values?.Size,
                    selectedColor: currentVariant?.attribute_values?.Color,
                    quantity,
                    priceSnapshot: salePriceValue ?? 0
                })
            );
            const size = currentVariant?.attribute_values?.Size;
            const color = currentVariant?.attribute_values?.Color;
            const suffix = [size, color].filter(Boolean).join('/');
            toast.success(
                `Added: ${productDetails?.name ?? 'Product'}${
                    suffix ? ` • ${suffix}` : ''
                } × ${quantity}`
            );
            setOpen(false);
            return true;
        } catch {
            toast.error('Failed to add to cart');
            setOpen(false);
            return false;
        } finally {
            setIsAdding(false);
        }
    };

    const handleAddToCartClick = async () => {
        if (!isInStock) {
            toast?.error?.('This product is currently out of stock');
            return false;
        }
        await doAddToCart();
        setOpen(false);
    };

    const handleBuyNowClick = async () => {
        if (!isInStock) {
            toast?.error?.('This product is currently out of stock');
            return false;
        }
        const ok = await doAddToCart();
        if (ok) router.push('/checkout');
        setOpen(false);
    };

    /* ------------------------------ Render ------------------------------- */
    const name = productDetails?.name ?? 'Product';
    const coinPerOrder = productDetails?.coin_per_order ?? 0;
    const isFreeDelivery = productDetails?.is_free_delivery ?? false;
    const shipping_cost = productDetails?.shipping_cost ?? 0;

    return (
        /* 1. Added max-h and overflow-y-auto for small screens */
        <div className='flex max-h-[90vh] w-full scrollbar-thin scrollbar-thumb-gray-200 flex-col overflow-y-auto bg-white md:flex-row'>
            {/* Product Image Section */}
            <div className='flex w-full items-center justify-center border-b bg-gray-50 p-2 sm:p-4 md:w-5/12 md:border-r md:border-b-0'>
                {/* 2. Smaller image container on mobile (h-48) vs desktop (aspect-square) */}
                <div className='relative h-28 w-full max-w-[250px] sm:h-48 md:aspect-square md:h-auto md:max-w-full'>
                    <Image
                        src={product?.thumbnail || '/No_Image_Available.jpg'}
                        alt={product?.name || 'Product'}
                        fill
                        sizes='(min-width: 768px) 40vw, 250px'
                        className='object-contain'
                    />
                </div>
            </div>

            {/* Product Details Content */}
            <div className='flex w-full flex-col justify-between p-2 sm:p-4 md:w-7/12 md:p-6'>
                <div className='space-y-2'>
                    {/* Title */}
                    <div>
                        <h1 className='text-lg font-medium text-gray-900 md:text-xl'>
                            {name}
                        </h1>
                    </div>

                    {/* Price */}
                    <div className='space-y-2'>
                        <div className='flex items-center gap-3'>
                            <span className='text-xl font-semibold text-gray-900 sm:text-2xl'>
                                Tk {Number(salePriceValue).toLocaleString()}
                            </span>
                            {regularPriceValue > salePriceValue && (
                                <>
                                    <span className='text-lg text-gray-500 line-through sm:text-xl'>
                                        Tk{' '}
                                        {Number(
                                            regularPriceValue
                                        ).toLocaleString()}
                                    </span>
                                    <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 sm:text-sm'>
                                        <CheckCircle className='h-3 w-3' />
                                        {discountPercentage}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <ProductVariantSelector
                            attributeKeys={attributeKeys}
                            attributeOptions={attributeOptions}
                            selectedAttributes={selectedAttributes}
                            handleAttributeChange={handleAttributeChange}
                            showAttrErrors={showAttrErrors}
                            sku={selectedVariant?.sku}
                            isInStock={isInStock} // Simplified: In stock if variant exists
                            totalAvailable={totalAvailable} // Replace with real stock logic
                            quantity={quantity}
                            setQuantity={setQuantity}
                            maxOrderQty={5}
                        />

                        <div className='flex flex-col items-start gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4'>
                            <p className='flex items-center gap-1'>
                                <Info className='h-4 w-4' />
                                Inclusive of all taxes •{' '}
                                {isFreeDelivery
                                    ? 'Free shipping'
                                    : `Shipping: Tk ${shipping_cost}`}
                            </p>
                            {coinPerOrder > 0 && (
                                <p className='flex items-center gap-1 text-yellow-700'>
                                    <CheckCircle className='h-4 w-4' />
                                    Earn {coinPerOrder} coins
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Attribute, Quantity, Actions */}
                    <ProductActionsBtn
                        attributeOptions={attributeOptions}
                        selectedAttributes={selectedAttributes}
                        setSelectedAttributes={setSelectedAttributes}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        onAddToCart={handleAddToCartClick}
                        onBuyNow={handleBuyNowClick}
                        discountPercentage={discountPercentage}
                        isInStock={isInStock}
                    />
                </div>
            </div>
        </div>
    );
};

{
    /* Top Badges */
}
{
    /* <div className="flex justify-between items-start">
            <span className="bg-gradient-to-r from-primary/70 via-primary/90 to-primary text-white text-[9px] md:text-[11px] font-medium px-4 py-1 rounded-br-2xl p-1">
              {calculateDiscount(regular_price, sell_price)}
            </span>
            {offerTag && (
              <span
                className={cn(
                  "bg-gradient-to-r from-primary/70 via-primary/90 to-primary text-[9px] md:text-[11px] font-medium !px-4 py-1 flex items-center gap-0.5 text-white p-1 rounded-bl-2xl"
                )}
              >
                <Flame className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current shrink-0" />

                <span className="md:hidden">
                  {offerTag.length > 8
                    ? `${offerTag.substring(0, 8)}...`
                    : offerTag}
                </span>

                <span className="hidden md:block">{offerTag}</span>
              </span>
            )}
          </div> */
}
