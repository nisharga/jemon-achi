interface ProductOptionsProps {
    attributeOptions: Record<string, string[]>;
    selectedAttributes: Record<string, string>;
    setSelectedAttributes: (val: any) => void;
    quantity: number;
    setQuantity: (q: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    discountPercentage: any;
    isInStock: boolean;
}

// ProductOptions
export const ProductActionsBtn: React.FC<ProductOptionsProps> = ({
    attributeOptions,
    selectedAttributes,
    setSelectedAttributes,
    quantity,
    setQuantity,
    onAddToCart,
    onBuyNow,
    discountPercentage,
    isInStock
}) => {
    return (
        <div className='flex max-w-md flex-col gap-2'>
            {/* Action Buttons */}
            <div className='mt-0 flex gap-2 sm:mt-2'>
                {/* Add to Cart */}
                <button
                    onClick={onAddToCart}
                    disabled={!isInStock}
                    className={`flex-1 rounded-full border-2 p-2 transition-colors sm:p-4 ${
                        !isInStock
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-600 opacity-70'
                            : 'cursor-pointer border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <div className='text-sm font-medium sm:text-base sm:font-semibold'>
                        {isInStock ? 'Add to cart' : 'Out of Stock'}
                    </div>
                </button>

                {/* Buy Now */}
                <button
                    onClick={onBuyNow}
                    disabled={!isInStock}
                    className={`flex-1 rounded-full p-2 transition-colors sm:p-4 ${
                        !isInStock
                            ? 'cursor-not-allowed bg-gray-300 text-gray-600 opacity-70'
                            : 'cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                >
                    <div className='text-sm font-medium sm:text-base sm:font-semibold'>
                        Buy now
                    </div>
                </button>
            </div>
        </div>
    );
};
