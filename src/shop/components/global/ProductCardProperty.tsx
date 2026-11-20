import React from 'react';

const ProductCardProperty = ({ product_card_properties }: any) => {
    return (
        <>
            {product_card_properties?.map((data: any, index: number) => {
                // Convert strings to numbers to be safe
                const current = Number(data?.current_value) || 0;
                const total = Math.ceil(Number(data?.max_value) || 0);

                return (
                    <div className='pt-1' key={index}>
                        <h5 className='sm-medium mb-0 text-center'>
                            {data?.title}
                        </h5>
                        <div className='mb-1 flex items-center justify-center gap-2'>
                            <p className='text-xs font-medium text-primary'>
                                {data?.min_text}
                            </p>
                            <div className='flex items-center justify-center gap-1'>
                                {/* Create an array based on the max_value */}
                                {[...Array(total)]?.map((_, pillIndex) => {
                                    // If the current pill's position (1-based) is <= current_value, it's active
                                    const isActive = pillIndex + 1 <= current;

                                    return isActive ? (
                                        <ActivePill key={pillIndex} />
                                    ) : (
                                        <InActivePill key={pillIndex} />
                                    );
                                })}
                            </div>

                            <p className='text-xs font-medium text-primary'>
                                {data?.max_text}
                            </p>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default ProductCardProperty;

const ActivePill = () => {
    return (
        <div className='h-0.5 w-2 rounded-lg bg-primary lg:h-1 lg:w-4'></div>
    );
};

const InActivePill = () => {
    return (
        <div className='h-0.5 w-2 rounded-lg bg-gray-300 lg:h-1 lg:w-4'></div>
    );
};
