import { Badge } from '@/components/public/ui/badge';
import { Button } from '@/components/public/ui/button';
import { cn } from '@/lib/public-utils';
import { Minus, Plus } from 'lucide-react';
import AvailabilityBox from './AvailabilityBox';
import { useEffect, useMemo } from 'react';
import { StockAlert } from '@/components/public/skeleton';
import { useRouter } from 'next/navigation';

interface VariantSelectorProps {
    attributeKeys: string[];
    attributeOptions: Record<string, string[]>;
    selectedAttributes: Record<string, string>;
    handleAttributeChange: (key: string, value: string) => void;
    showAttrErrors?: boolean;
    // Stock & SKU
    sku?: string;
    isInStock: boolean;
    stockLoading?: boolean;
    totalAvailable?: number;
    // Quantity
    quantity: number;
    setQuantity: (val: number) => void;
    minOrderQty?: number;
    maxOrderQty?: number;
    onAddToCart: () => void;
    shipping_cost: any;
    deliveryTime: any;
    variants: any;
    setImages: any;
    setVideos: any;
    setRegularPrice: any;
    setSellPrice: any;
    product_card_properties: any;
    product_specifications: any;
    // Cart state
    isVariantInCart?: boolean;
    loading?: boolean;
}

export function ProductVariantSelector({
    attributeKeys,
    attributeOptions,
    selectedAttributes,
    handleAttributeChange,
    showAttrErrors,
    sku,
    stockLoading,
    totalAvailable,
    quantity,
    setQuantity,
    minOrderQty = 1,
    maxOrderQty = 10,
    isInStock,
    onAddToCart,
    shipping_cost,
    deliveryTime,
    variants,
    setImages,
    setVideos,
    setRegularPrice,
    setSellPrice,
    product_card_properties,
    product_specifications,
    isVariantInCart = false,
    loading
}: VariantSelectorProps) {
    const router = useRouter();

    // 1. Find the active variant based on current selections
    useEffect(() => {
        if (!variants || Object.keys(selectedAttributes).length === 0) return;

        // Find a variant that matches ALL currently selected attributes
        const matchedVariant = variants?.find((variant: any) => {
            return Object.entries(selectedAttributes ?? {}).every(
                ([key, value]) => variant?.attribute_values?.[key] === value
            );
        });

        // If we have a full match, update the media
        if (matchedVariant) {
            if (matchedVariant?.images?.length > 0) {
                setImages(matchedVariant.images);
            }
            if (matchedVariant?.videos) {
                setVideos(matchedVariant.videos);
            }
            if (matchedVariant?.regular_price) {
                /* setRegularPrice(matchedVariant.regular_price); */
                setRegularPrice(matchedVariant?.regular_price ?? 0);
            }
            if (matchedVariant?.sale_price) {
                setSellPrice(matchedVariant?.sale_price ?? 0);
            }
        }
        // OPTIONAL: If only Color is selected, show the first available variant for that color
        else if (selectedAttributes?.['color']) {
            const colorOnlyMatch = variants?.find(
                (v: any) =>
                    v?.attribute_values?.color === selectedAttributes['color']
            );
            if (colorOnlyMatch?.images?.length > 0) {
                setImages(colorOnlyMatch.images);
            }
        }
    }, [
        selectedAttributes,
        variants,
        setImages,
        setVideos,
        setRegularPrice,
        setSellPrice
    ]);

    // Helper to find the color hex code for the swatches
    const getColorHex = (attributeName: string, value: string) => {
        if (attributeName?.toLowerCase() !== 'color') return null;

        const variant = variants?.find(
            (v: any) =>
                v?.attribute_values?.color?.toLowerCase() ===
                value?.toLowerCase()
        );
        return variant?.color_code;
    };

    return (
        <div className='space-y-2'>
            <div className='space-y-4'>
                {attributeKeys?.map((attribute) => {
                    const isColor = attribute.toLowerCase() === 'color';
                    const valueSelected = !!selectedAttributes?.[attribute];
                    const isMissing = showAttrErrors && !valueSelected;

                    return (
                        <div key={attribute} className='space-y-2'>
                            <h2 className='base-medium tracking-tight uppercase'>
                                {attribute}:{' '}
                                {valueSelected && (
                                    <span className='base-medium text-gray-600'>
                                        {selectedAttributes[attribute]}
                                    </span>
                                )}
                            </h2>

                            <div className='flex flex-wrap gap-2'>
                                {(attributeOptions?.[attribute] || []).map(
                                    (value) => {
                                        const isSelected =
                                            selectedAttributes?.[attribute] ===
                                            value;
                                        const hexCode = getColorHex(
                                            attribute,
                                            value
                                        );

                                        // Render Circular Swatch for Color
                                        if (isColor && hexCode) {
                                            return (
                                                <button
                                                    key={`${attribute}-${value}`}
                                                    type='button'
                                                    onClick={() =>
                                                        handleAttributeChange(
                                                            attribute,
                                                            value
                                                        )
                                                    }
                                                    style={{
                                                        backgroundColor: hexCode
                                                    }}
                                                    className={cn(
                                                        'h-5 w-5 cursor-pointer rounded-full border border-black/10 ring-offset-2 transition-all lg:h-8 lg:w-8',
                                                        isSelected
                                                            ? 'scale-110 ring-2 ring-primary'
                                                            : 'ring-0 hover:scale-105'
                                                    )}
                                                    title={value}
                                                />
                                            );
                                        }

                                        // Render Default Button for Size/Other
                                        return (
                                            <Button
                                                key={`${attribute}-${value}`}
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleAttributeChange(
                                                        attribute,
                                                        value
                                                    )
                                                }
                                                className={cn(
                                                    'cursor-pointer text-xs transition-all',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                                                        : 'bg-white'
                                                )}
                                            >
                                                {value}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>
                            {isMissing && (
                                <p className='text-[10px] font-medium text-red-500'>
                                    Please select {attribute}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Ensure loading is finished AND totalAvailable is exactly 0 */}
            {!loading && totalAvailable === 0 && <StockAlert />}

            {/* Availability Box */}
            <AvailabilityBox
                sku={sku}
                stockLoading={stockLoading}
                selectedAttributes={selectedAttributes}
                isInStock={isInStock}
                totalAvailable={totalAvailable}
                deliveryTime={deliveryTime}
                shipping_cost={shipping_cost}
                // product_card_properties
                product_card_properties={product_card_properties}
                product_specifications={product_specifications}
            />
            <div className='flex gap-4'>
                <div className='flex rounded-sm border border-gray-300'>
                    <button
                        type='button'
                        disabled={quantity <= minOrderQty}
                        onClick={() => setQuantity(quantity - 1)}
                        className='sm-medium cursor-pointer border-r px-1.5 py-1.5 transition-colors hover:bg-gray-100 disabled:opacity-50 lg:px-3 lg:py-2'
                    >
                        -
                    </button>
                    <input
                        type='text'
                        readOnly
                        aria-label='Quantity'
                        value={quantity}
                        className='sm-medium w-10 text-center outline-none'
                    />
                    <button
                        type='button'
                        // disabled={quantity >= maxOrderQty || !isInStock}
                        onClick={() => setQuantity(quantity + 1)}
                        className='sm-medium cursor-pointer border-l px-3 py-2 transition-colors hover:bg-gray-100 disabled:opacity-50'
                    >
                        +
                    </button>
                </div>
                <button
                    type='button'
                    onClick={() => {
                        onAddToCart();
                        router.push('/checkout');
                    }}
                    // disabled={!isInStock}
                    className={cn(
                        'sm-medium flex-1 cursor-pointer rounded-full bg-primary py-1.5 font-normal tracking-widest text-primary-foreground uppercase transition-all hover:bg-black hover:text-white lg:py-3'
                    )}
                >
                    Buy Now
                </button>

                <button
                    type='button'
                    onClick={onAddToCart}
                    // disabled={!isInStock}
                    className={cn(
                        'sm-medium text-primary-ink flex-1 cursor-pointer rounded-full border border-primary bg-transparent py-1.5 font-normal tracking-widest uppercase transition-all hover:bg-black hover:text-white lg:py-3'
                    )}
                >
                    {isVariantInCart
                        ? `Added ${quantity > 0 ? `(${quantity})` : ''}`
                        : isInStock
                          ? `Add to cart`
                          : `Add to cart`}
                </button>
            </div>
        </div>
    );
}
