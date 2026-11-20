import { Badge } from '@/shop/components/ui/badge';
import { Button } from '@/shop/components/ui/button';
import { cn } from '@/shop/lib/utils';
import { Minus, Plus } from 'lucide-react';

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
    onAddToCart?: () => void;
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
    onAddToCart
}: VariantSelectorProps) {
    const hasSelection = Object.keys(selectedAttributes || {}).length > 0; // {Size: '42', Color: 'Black'}

    return (
        <div className='space-y-2'>
            {/* Dynamic Attributes (Color, Size, etc.) */}
            <div className='space-y-2'>
                {attributeKeys?.map((attribute) => {
                    const valueSelected = !!selectedAttributes?.[attribute];
                    const isMissing = showAttrErrors && !valueSelected;

                    return (
                        <div key={attribute} className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium text-gray-700'>
                                    {attribute}:{' '}
                                    {valueSelected && (
                                        <span className='ml-2 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-900'>
                                            {selectedAttributes[attribute]}
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                {(attributeOptions?.[attribute] || []).map(
                                    (value) => {
                                        const isSelected =
                                            selectedAttributes?.[attribute] ===
                                            value;
                                        return (
                                            <Button
                                                key={`${attribute}-${value}`}
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleAttributeChange(
                                                        attribute,
                                                        value
                                                    )
                                                }
                                                aria-invalid={
                                                    !isSelected && isMissing
                                                        ? true
                                                        : undefined
                                                }
                                                className={cn(
                                                    'text-xs transition-all',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                                                        : 'bg-white hover:border-gray-400 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-100'
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

            {/* SKU & Stock Status */}
            <div className='flex items-center gap-4 border-y border-gray-50 py-2'>
                <div className='flex flex-col gap-1'>
                    <span className='text-[10px] font-semibold tracking-wider text-gray-400 uppercase'>
                        SKU
                    </span>
                    <Badge
                        variant='secondary'
                        className='px-2 py-0 font-mono text-[10px] text-white'
                    >
                        {sku || 'N/A'}
                    </Badge>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='text-[10px] font-semibold tracking-wider text-gray-400 uppercase'>
                        Availability
                    </span>
                    {/* {stockLoading ? (
            <span className="text-xs text-gray-400 animate-pulse">
              Checking...
            </span>
          ) : (
            <span
              className={cn(
                "text-xs font-bold",
                !hasSelection
                  ? "text-orange-500"
                  : isInStock
                  ? "text-green-600"
                  : "text-red-500"
              )}
            >
              {!hasSelection
                ? "Select options"
                : isInStock
                ? ` in stock`
                : "Out of stock"}
            </span>
          )} */}
                    {stockLoading ? (
                        <span className='animate-pulse text-xs text-gray-400'>
                            Checking stock…
                        </span>
                    ) : (
                        <span
                            className={cn(
                                'text-xs font-medium',
                                Object.keys(selectedAttributes || {})
                                    ?.length === 0
                                    ? 'text-orange-500'
                                    : isInStock
                                      ? 'text-green-600'
                                      : 'text-red-500'
                            )}
                        >
                            {Object.keys(selectedAttributes || {})?.length === 0
                                ? 'Select your preference'
                                : isInStock
                                  ? `In Stock (Limited Quantity)`
                                  : 'Stock Out'}
                        </span>
                    )}
                </div>
            </div>

            {/* Quantity Selector */}
            {/*  <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Quantity:</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg p-1 bg-gray-50/50">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              disabled={quantity <= minOrderQty}
              onClick={() => setQuantity(quantity - 1)}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-10 text-center text-sm font-bold">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              disabled={quantity >= maxOrderQty || !isInStock}
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div> */}

            <div className='flex gap-4'>
                <div className='flex rounded-sm border border-gray-300'>
                    <button
                        disabled={quantity <= minOrderQty}
                        onClick={() => setQuantity(quantity - 1)}
                        className='cursor-pointer border-r px-1.5 py-1.5 transition-colors hover:bg-gray-100 lg:px-3 lg:py-2'
                    >
                        -
                    </button>
                    <input
                        type='text'
                        readOnly
                        value={quantity}
                        className='w-10 text-center outline-none'
                    />
                    <button
                        disabled={quantity >= maxOrderQty || !isInStock}
                        onClick={() => setQuantity(quantity + 1)}
                        className='cursor-pointer border-l px-3 py-2 transition-colors hover:bg-gray-100'
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={onAddToCart}
                    disabled={!isInStock}
                    className={`flex-1 rounded-full bg-primary py-1.5 font-semibold tracking-widest text-secondary uppercase transition-all hover:bg-black lg:py-3 ${
                        !isInStock
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-70'
                            : 'cursor-pointer border-gray-300 text-gray-900'
                    }`}
                >
                    {isInStock ? 'Add to cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}
