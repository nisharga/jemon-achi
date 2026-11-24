'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/shop/components/common/container';
import {
    useGetAllVariantByAProductQuery,
    useGetProductDetailQuery,
    useGetSingleProductByIdQuery,
    useGetStockByProductVariantQuery
} from '@/shop/redux/api/product-api';
import ImageZoom from './ImageZoom';
import ProductShortVideos from './ProductShortVideos';
import { cn } from '@/shop/lib/utils';
import {
    Star,
    MessageSquare,
    ShieldCheck,
    Truck,
    CheckCircle
} from 'lucide-react';
import GlobalLoading from '@/shop/components/global/GlobalLoading';
import SingleProductDetails from './SingleProductDetails';
import RelatedProducts from './RelatedProducts';
import { toast } from 'sonner';
import { addToCart, selectCartItems } from '@/shop/redux/features/cart-slice';
import { useAppDispatch, useAppSelector } from '@/shop/redux/store';
import { skipToken } from '@reduxjs/toolkit/query';
import { ProductVariantSelector } from './ProductVariantSelector';
import { sendGTMEvent } from '@next/third-parties/google';
import ErrorState from '@/shop/components/global/ErrorState';
import Link from 'next/link';
import { trackMetaFromGtmEvent } from '@/shop/lib/meta-pixel';
import { useGetCmsOfferQuery } from '@/shop/redux/api/offer';
import DiscountBadge from '@/shop/components/shared/DiscountBadge';
import { useProductOffer } from '@/shop/hooks/useProductOffer';
import StarRating from '@/shop/components/common/StarRating';
import { useGetReviewRatingByProductIdQuery } from '@/shop/redux/api/review';
import { ProductData, Variant } from '@/shop/types/product-detail';
import { computeAvailableFromStockPayload } from '@/shop/components/product/computeAvailableFromStockPayload';

type ProductDetailProps = {
    slug: string;
    /**
     * Server-rendered top of the page (picture, name, price), shown while the
     * interactive data loads instead of a spinner. See ProductFirstView.tsx.
     */
    firstView?: React.ReactNode;
};

const ProductDetail = ({ slug, firstView }: ProductDetailProps) => {
    const { data: p, isLoading } = useGetProductDetailQuery(
        {
            slug
        },
        { skip: !slug }
    );
    const singleProductDetails = p?.data;

    const {
        data,
        isLoading: isLoadingSingleProduct,
        error,
        isError,
        refetch,
        isFetching
    } = useGetSingleProductByIdQuery({
        product_id: slug
    });

    const productDetails = (data?.data?.product ?? null) as ProductData | null;
    const productId = data?.data?.product?._id;
    const subCategoryId = data?.data?.product?.subcategory?._id;
    const highlightsLabel = productDetails?.highlight_labels;

    const { data: variantsData, isLoading: variantsLoading } =
        useGetAllVariantByAProductQuery(
            { product_id: productId as string },
            { skip: !productId }
        );

    const variants = (variantsData?.data ?? null) as any | null;

    const productImages =
        productDetails?.slider_images?.map?.((url: string, index: number) => ({
            url,
            id: index.toString(),
            alt: `Product image ${index + 1}`
        })) ?? [];

    if (productDetails?.thumbnail) {
        productImages.unshift({
            url: productDetails.thumbnail,
            id: 'thumbnail',
            alt: 'Main product image'
        });
    }

    const dispatch = useAppDispatch();
    const router = useRouter();
    const cartItems = useAppSelector(selectCartItems);

    /* ----------------------------- UI State ------------------------------ */
    // const [selectedImage, setSelectedImage] = useState<number>(0);
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    /* const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({}); */
    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const [showAttrErrors, setShowAttrErrors] = useState(false);

    // images and videos
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [regularPrice, setRegularPrice] = useState(0);
    const [sellPrice, setSellPrice] = useState(0);

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
            Object.entries(selectedAttributes ?? {}).every(
                ([k, val]) => v.attribute_values?.[k] === val
            )
        );
        return match ?? variants?.[0];
    }, [variants, selectedAttributes]);

    // 2. Derive Attribute Keys and Options from the API data
    const { attributeKeys, attributeOptions } = useMemo(() => {
        const keys = new Set<string>();
        const options: Record<string, Set<string>> = {};

        // FIXED: Iterate over 'variants' (from variantsData) instead of productDetails
        variants?.forEach((v: any) => {
            Object.entries(v?.attribute_values || {})?.forEach(
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

    // 3. Find the currently selected variant object
    /* const selectedVariant = useMemo(() => {
    const isAllSelected = attributeKeys.every((key) => selectedAttributes[key]);
    if (!isAllSelected || !variants) return null;

    // FIXED: Search in 'variants'
    return variants.find((v: any) =>
      attributeKeys.every(
        (key) => v.attribute_values[key] === selectedAttributes[key]
      )
    );
  }, [selectedAttributes, attributeKeys, variants]); */

    // 4. Handle Selection
    const handleAttributeChange = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: value
        }));
        setShowAttrErrors(false);
    };

    // Initialize default selection to the first variant's attributes (nice UX)
    useEffect(() => {
        if (variants?.length) {
            const first = variants?.[0];
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
        setSelectedVariant(match ?? null);
    }, [selectedAttributes, attributeKeys, variants]);

    // GoogleTagManager
    useEffect(() => {
        if (singleProductDetails?.product) {
            const productData = singleProductDetails?.product;
            const price =
                (currentVariant?.sale_price ?? variants?.[0]?.sale_price) || 0;
            const ecommerce = {
                currency: 'BDT',
                value: Number(price) || 0,
                items: [
                    {
                        item_id:
                            productData?._id?.toString() || productData?.slug,
                        item_name: productData?.name || '',
                        item_category: productData?.category?.name_en || '',
                        item_slug: slug || '',
                        price: Number(price) || 0,
                        quantity: 1
                    }
                ]
            };

            sendGTMEvent({ event: 'view_item', ecommerce });
            trackMetaFromGtmEvent('view_item', ecommerce);
        }
    }, [p, slug, currentVariant, variants]);

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

    // offer hook
    const {
        newPrice,
        offerLabel,
        isOfferApplied,
        isLoadingOffer,
        discountPercentage: discountValue
    } = useProductOffer(subCategoryId, regularPriceValue);

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

            // google tag manager

            // 3. Fire Google Tag Manager Event
            // Google Tag Manager Event
            const ecommerce = {
                currency: 'BDT',
                value:
                    currentVariant?.sale_price ??
                    variants?.[0]?.sale_price ??
                    regularPriceValue,
                items: [
                    {
                        item_id:
                            productDetails?._id?.toString() ||
                            productDetails?.slug,
                        item_name: productDetails?.name || '',
                        item_category: productDetails?.category?.name_en || '',
                        item_variant: suffix || 'Default',
                        price:
                            currentVariant?.sale_price ??
                            variants?.[0]?.sale_price ??
                            regularPriceValue,
                        quantity: quantity
                    }
                ]
            };

            sendGTMEvent({ event: 'add_to_cart', ecommerce });
            trackMetaFromGtmEvent('add_to_cart', ecommerce);

            toast.success(
                `Added: ${productDetails?.name ?? 'Product'}${
                    suffix ? ` • ${suffix}` : ''
                } × ${quantity}`
            );
            return true;
        } catch {
            toast.error('Failed to add to cart');
            return false;
        } finally {
            setIsAdding(false);
        }
    };

    const handleAddToCartClick = async () => {
        /* if (!isInStock) {
      toast.error("This product is currently out of stock");
      return false;
    } */
        await doAddToCart();
    };

    const handleBuyNowClick = async () => {
        if (!isInStock) {
            toast.error('This product is currently out of stock');
            return false;
        }
        const ok = await doAddToCart();
        if (ok) router.push('/checkout');
    };

    // Check if current variant is in cart
    const isVariantInCart = useMemo(() => {
        if (!currentVariant || !productDetails) return false;
        const selectedSize = currentVariant?.attribute_values?.Size;
        const selectedColor = currentVariant?.attribute_values?.Color;

        return cartItems.some(
            (item) =>
                item.product?.sku === productDetails?.sku &&
                item.variantId === currentVariant?._id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
        );
    }, [currentVariant, productDetails, cartItems]);

    // 5. Determine Prices
    // const displayPrice = selectedVariant
    //   ? selectedVariant.sale_price
    //   : productDetails?.variants[0]?.sale_price || 0;
    /*  const regularPrice = selectedVariant
    ? selectedVariant.regular_price
    : productDetails?.variants[0]?.regular_price || 0; */

    /* ------------------------------ Render ------------------------------- */
    const name = productDetails?.name ?? 'Product';
    const description = productDetails?.description ?? '';
    // const categoryName = productDetails?.category?.name_en || "No Category";
    const categoryId = productDetails?.category?._id;
    const offerTags = productDetails?.offer_tags ?? [];
    const coinPerOrder = productDetails?.coin_per_order ?? 0;

    const deliveryTime =
        productDetails?.approximately_delivery_time ?? 'Standard delivery';
    const isFreeDelivery = productDetails?.is_free_delivery ?? false;
    const shipping_cost = productDetails?.shipping_cost ?? 0;
    // const warranty = productDetails?.warranty ?? "No warranty";
    const returnPolicy = productDetails?.return_policy ?? 'No returns';
    const delivery_time =
        productDetails?.approximately_delivery_time ?? 'No returns';
    const hasPreOrder = offerTags?.includes('pre-order') ?? false;
    const max_order_qty = productDetails?.max_order_qty || '0';
    const min_order_qty = productDetails?.min_order_qty || '0';
    const slug_product = productDetails?.category?.slug || '';

    const categories = singleProductDetails?.category ?? [];
    const categoryName = singleProductDetails?.product?.category?.name_en;

    const categorySlug = singleProductDetails?.product?.category?.slug;
    const productName = singleProductDetails?.product?.name || '';

    const rating = singleProductDetails?.product?.total_rating ?? 0;
    const reviews = singleProductDetails?.product?.reviews?.length ?? 0;
    const sku = singleProductDetails?.product?.sku || '';
    const id = singleProductDetails?.product?._id || '';
    const message =
        singleProductDetails?.product?.return_policy?.title ||
        singleProductDetails?.product?.return_policy?.description ||
        (typeof singleProductDetails?.product?.return_policy === 'string'
            ? singleProductDetails?.product?.return_policy
            : '');
    const warranty = singleProductDetails?.product?.warranty;
    const return_policy =
        productDetails?.return_policy?.description || 'No return policy';

    const product_card_properties =
        singleProductDetails?.product?.product_card_properties ?? null;
    const product_specifications =
        singleProductDetails?.product?.product_specifications ?? null;

    const price = singleProductDetails?.product?.price ?? 0;
    const brandName = productDetails?.brand?.name || '';

    // ============================ Rating Product =======================================

    const { data: ratingData, isLoading: isLoadingRating } =
        useGetReviewRatingByProductIdQuery({ slug });
    const averageRating = ratingData?.data?.averageRating ?? 0;
    const totalReviews = ratingData?.data?.totalReviews ?? 0;

    // =========================================================================
    const loading =
        isLoading ||
        isLoadingSingleProduct ||
        isLoadingOffer ||
        stockLoading ||
        variantsLoading ||
        isLoadingRating;

    if (loading)
        return (
            firstView ?? (
                <div className='min-h-[100vh]'>
                    <GlobalLoading />
                </div>
            )
        );

    if (!productId && !loading) {
        return (
            <div className='flex min-h-[90vh] flex-col items-center justify-center py-20 text-center text-lg text-gray-600 lg:text-2xl'>
                No Product Found!
                <Link
                    href={'/'}
                    className='rounded-md bg-primary px-2 py-1 pt-2 text-sm text-primary-foreground hover:bg-primary/80'
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    if (isError) {
        return <ErrorState isError={isError} onRetry={refetch} />;
    }

    return (
        <>
            <Container className='py-4 sm:py-8'>
                <div className='flex flex-col gap-4 lg:flex-row lg:gap-12'>
                    {/* Left: Interactive Gallery */}
                    <div className='grid w-full grid-cols-2 gap-2 lg:w-[60%]'>
                        <div className={'col-span-2'}>
                            <ImageZoom
                                images={images}
                                videos={videos}
                                shortVideos={productDetails?.short_videos}
                            />
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className='w-full space-y-2 lg:w-[40%]'>
                        <div className='space-y-2'>
                            <a
                                href={`/category/${categorySlug}`}
                                className='sm-normal-gray block'
                            >
                                {categoryName}
                            </a>
                            <h1 className='two-xl-medium tracking-tight lg:text-3xl'>
                                {productName}
                            </h1>
                        </div>

                        <StarRating
                            rating={averageRating}
                            reviews={totalReviews}
                        />

                        <div className='flex items-center gap-2'>
                            {isOfferApplied ? (
                                /* --- CASE A: SPECIAL OFFER IS ACTIVE --- */
                                <>
                                    {/* The Discounted Price calculated by the hook */}
                                    <span className='two-xl-medium'>
                                        ৳{newPrice}
                                    </span>

                                    {/* The Original Price (Crossed out) */}
                                    <span className='two-xl-medium text-gray-600 line-through'>
                                        ৳{regularPrice}
                                    </span>

                                    {/* The Animated Badge from the hook's label */}
                                    {offerLabel && (
                                        <DiscountBadge
                                            label={offerLabel}
                                            percentage={discountValue}
                                        />
                                    )}
                                </>
                            ) : (
                                /* --- CASE B: REGULAR VIEW (Offer not active or not eligible) --- */
                                <>
                                    {/* Fallback to standard selling price */}
                                    <span className='two-xl-medium'>
                                        ৳{sellPrice}
                                    </span>

                                    {/* Standard discount (if any) unrelated to the Special Sale */}
                                    {regularPrice > sellPrice && (
                                        <span className='two-xl-medium text-gray-600 line-through'>
                                            ৳{regularPrice}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {brandName && <p className='lg-normal'>{brandName}</p>}

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
                            maxOrderQty={totalAvailable ?? 5} // Use dynamic stock limit, fallback to 5
                            // on buy now
                            onAddToCart={handleAddToCartClick}
                            shipping_cost={shipping_cost}
                            deliveryTime={deliveryTime}
                            // variant
                            variants={variants}
                            // images videos
                            setImages={setImages}
                            setVideos={setVideos}
                            setRegularPrice={setRegularPrice}
                            setSellPrice={setSellPrice}
                            // product_card_properties
                            product_card_properties={product_card_properties}
                            product_specifications={product_specifications}
                            // cart state
                            isVariantInCart={isVariantInCart}
                            // loading
                            loading={loading}
                        />

                        {/* Pre-order (shown when flagged for pre-order or out of stock) */}
                        {/* {(hasPreOrder || !isInStock) && (
       <Link
        href={`/pre-order?product=${id}&name=${encodeURIComponent(
         productName,
        )}&image=${encodeURIComponent(
         productDetails?.thumbnail || "",
        )}&price=${price}`}
        className='flex items-center justify-center gap-2 w-full border-2 border-primary text-primary-ink hover:bg-primary hover:text-primary-foreground transition-colors rounded-sm py-3 font-medium'>
        <Truck size={18} />
        {isInStock ? "Pre-order this product" : "Out of stock — Pre-order now"}
       </Link>
      )} */}

                        {/* Bulk Pricing */}
                        {/* <div className='bg-[#EBF7FF] p-5 rounded-sm text-center border border-[#BCE4FF]pb-4'>
       <p className='sm-normal-gray'>
        Bulk Pricing: <span className='font-normal'>Buy 3+ save 30%</span>
       </p>
       <p className='sm-normal-gray mt-1'>
        Use Code <span className='uppercase'>GRIIP30</span>
       </p>
      </div> */}

                        {/* Support Footer */}
                        <div className='mt-2 space-y-2 border-t pt-2'>
                            {message && (
                                <div className='xs-normal flex items-center gap-3 text-gray-600'>
                                    <MessageSquare
                                        size={18}
                                        className='min-h-4 min-w-4 text-gray-600'
                                    />
                                    <span>{message}</span>
                                </div>
                            )}

                            {warranty && (
                                <div className='xs-normal flex items-center gap-3 text-gray-600'>
                                    <ShieldCheck
                                        size={18}
                                        className='min-h-4 min-w-4 text-gray-600'
                                    />
                                    <span>{warranty}</span>
                                </div>
                            )}

                            {return_policy && (
                                <div className='flex items-start gap-2'>
                                    <CheckCircle
                                        size={16}
                                        strokeWidth={3}
                                        className='min-w-4 text-gray-600'
                                    />
                                    <div
                                        className='prose prose-sm max-w-none text-sm'
                                        dangerouslySetInnerHTML={{
                                            __html: return_policy
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>

            {(productDetails?.short_videos?.length ?? 0) > 0 && (
                <Container className='py-4 sm:py-8'>
                    <ProductShortVideos videos={productDetails?.short_videos} />
                </Container>
            )}

            <Container className='py-4 sm:py-8'>
                <SingleProductDetails
                    id={id}
                    slug={slug}
                    productDetails={productDetails}
                />
            </Container>

            {/* Related products from the same category (by category id) */}
            <RelatedProducts
                categoryId={categoryId}
                currentProductId={productId}
            />
        </>
    );
};

export default ProductDetail;
