import React from 'react';

/**
 * Price display: current price, struck-through old price and "% OFF" when discounted,
 * or "TBA" when there is no valid price. Prices are in BDT (৳).
 */
const PriceContainer = ({
    newPrice,
    oldPrice,
    className = ''
}: {
    newPrice?: number | string;
    oldPrice?: number | string;
    className?: string;
}) => {
    const currentPrice = Number(newPrice);
    const previousPrice = Number(oldPrice);

    // Check if current price is a valid positive number (not 0, undefined, or NaN)
    const isValidPrice = !isNaN(currentPrice) && currentPrice > 0;

    // Check if old price is valid and greater than the new price
    const hasDiscount =
        isValidPrice && !isNaN(previousPrice) && previousPrice > currentPrice;

    const percentOff = hasDiscount
        ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
        : 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {isValidPrice ? (
                <>
                    {/* New / Current Price */}
                    <span className='lg-medium font-medium lg:font-semibold'>
                        ৳{currentPrice}
                    </span>

                    {/* Old Price & Discount Tag */}
                    {hasDiscount && (
                        <>
                            <span className='text-sm text-gray-400 line-through'>
                                ৳{previousPrice}
                            </span>

                            <span className='xss-normal text-red-600'>
                                {percentOff}% OFF
                            </span>
                        </>
                    )}
                </>
            ) : (
                /* Fallback when price is 0, undefined, or missing */
                <span className='lg-medium font-medium text-gray-500 lg:font-semibold'>
                    TBA
                </span>
            )}
        </div>
    );
};

export default PriceContainer;
