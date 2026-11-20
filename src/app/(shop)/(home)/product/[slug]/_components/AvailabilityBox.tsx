import { cn } from '@/shop/lib/utils';
import { Info, Truck } from 'lucide-react';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/shop/components/ui/dialog';

const AvailabilityBox = ({
    sku,
    stockLoading,
    selectedAttributes,
    isInStock,
    totalAvailable,
    deliveryTime,
    shipping_cost,
    product_card_properties, // Original flat array
    product_specifications // The new nested array
}: any) => {
    // Check if either array has data to show the button
    const hasDetails =
        (product_card_properties?.length ?? 0) > 0 ||
        (product_specifications?.length ?? 0) > 0;

    return (
        <div className='relative space-y-4 rounded-sm border border-gray-200 p-4'>
            {/* Availability Row */}
            <div className='sm-normal-gray flex flex-col justify-between gap-2 uppercase lg:flex-row'>
                <span>
                    Availability:{' '}
                    <span
                        className={cn(
                            'sm-normal-gray font-medium',
                            stockLoading
                                ? 'animate-pulse'
                                : Object.keys(selectedAttributes ?? {})
                                        ?.length === 0
                                  ? 'text-orange-500'
                                  : isInStock
                                    ? 'text-green-600'
                                    : 'text-red-500'
                        )}
                    >
                        {stockLoading
                            ? 'Checking stock…'
                            : Object.keys(selectedAttributes ?? {})?.length ===
                                0
                              ? 'Select your preference'
                              : isInStock
                                ? `In Stock (Limited Quantity)`
                                : 'Stock Out'}
                    </span>
                </span>
                <span>SKU {sku ?? 'N/A'}</span>
            </div>

            {/* Dynamic Specifications Modal */}
            {hasDetails && (
                <Dialog>
                    <DialogTrigger asChild>
                        <button className='flex items-center gap-1 text-xs font-semibold text-primary uppercase outline-none hover:underline'>
                            <Info size={14} /> Product Information
                        </button>
                    </DialogTrigger>
                    <DialogContent className='max-h-[80vh] max-w-md overflow-y-auto bg-white'>
                        <DialogHeader>
                            <DialogTitle className='text-lg font-bold uppercase'>
                                Product Information
                            </DialogTitle>
                        </DialogHeader>

                        <div className='space-y-4'>
                            {/* --- Section 2: Product Specifications (Nested) --- */}
                            {(product_specifications?.length ?? 0) > 0 && (
                                <div className='space-y-4'>
                                    {product_specifications?.map?.(
                                        (spec: any) => {
                                            const val = spec?.imported_value;
                                            return (
                                                <div
                                                    key={spec?._id}
                                                    className='border-b border-gray-50 pb-3 last:border-0'
                                                >
                                                    <p className='text-sm font-bold text-gray-800'>
                                                        {spec?.title}
                                                    </p>
                                                    <p className='mb-2 text-xs text-black'>
                                                        {val?.title}
                                                    </p>

                                                    <div className='flex items-center gap-2 rounded-sm bg-gray-50 p-2'>
                                                        {spec?.description?.map(
                                                            (
                                                                item: string,
                                                                i: number
                                                            ) => (
                                                                <span
                                                                    className='text-xs'
                                                                    key={i}
                                                                >
                                                                    <span className='text-black uppercase'>
                                                                        {item}{' '}
                                                                        {spec
                                                                            ?.description
                                                                            ?.length -
                                                                            1 !==
                                                                            i &&
                                                                            ','}
                                                                    </span>
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                    {/* <div className='flex justify-between items-center bg-gray-50 p-2 rounded-sm'>
             <span className='text-xs'>
              <span className='text-gray-500 uppercase'>{val?.min_text}:</span>{" "}
              {val?.min_value}
             </span>
             <span className='text-xs'>
              <span className='text-gray-500 uppercase'>{val?.max_text}:</span>{" "}
              {val?.max_value}
             </span>
            </div> */}

                                                    {/* <div className='mt-2 text-[11px] font-medium text-primary uppercase'>
             CURRENT SELECTION: {val?.current_value}
            </div> */}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Shipping Info */}
            {/* <div className="flex items-start gap-3 pt-2">
        <Truck className="sm-normal-gray shrink-0" />
        <div className="sm-medium font-normal leading-relaxed">
          Delivery: ৳80 within Dhaka | ৳120 Outside Dhaka
          <p className="sm-normal-primary text-gray-500 pt-1">
            Get it by {formatDeliveryRange(deliveryTime)}
          </p>
        </div>
      </div> */}
        </div>
    );
};

// Reusable Sub-component for General Properties
const PropertyItem = ({ prop }: any) => (
    <div className='border-b border-gray-50 pb-3 last:border-0'>
        <p className='mb-1 text-sm font-medium text-gray-500'>{prop.title}</p>
        <div className='flex items-center justify-between text-sm'>
            <span>
                <strong>{prop.min_text}:</strong> {prop.min_value}
            </span>
            <span>
                <strong>{prop.max_text}:</strong> {prop.max_value}
            </span>
        </div>
        <div className='mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase'>
            Current: {prop.current_value}
        </div>
    </div>
);

export default AvailabilityBox;

const formatDeliveryRange = (deliveryTime: string) => {
    // Extract numbers from the string (e.g., "3-5" -> [3, 5])
    const numbers = deliveryTime?.match(/\d+/g)?.map(Number);

    // If there isn't a range (like "3-5"), just return the original string
    if (!numbers || numbers.length < 2) {
        return deliveryTime ?? 'Standard delivery';
    }

    const [startDays, endDays] = numbers;
    const now = new Date();

    // Helper to format date as "MMM D" (e.g., Feb 25)
    const formatDate = (daysToAdd: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() + daysToAdd);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const startDate = formatDate(startDays);
    const endDate = formatDate(endDays);

    return `${deliveryTime} (${startDate} - ${endDate})`;
};
