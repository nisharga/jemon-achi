// utils/offerHelper.ts
export function calculateDiscountedPrice(
    product: any,
    variantPrice: number,
    offer: any
) {
    if (!offer || !offer.specialSaleActive) return variantPrice;

    const startDate = new Date(offer.offer_start_date);
    const currentDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(startDate.getDate() + offer.validFor);

    const isDateValid = currentDate >= startDate && currentDate <= expiryDate;

    // Check if the product's subcategory is in the offer's list
    const subCategoryId = product?.subcategory?._id || product?.subcategory;
    const isCategoryEligible = offer.applied_subcategories?.some(
        (cat: any) => (cat._id || cat) === subCategoryId
    );

    if (isDateValid && isCategoryEligible) {
        return Math.round(
            variantPrice - (variantPrice * offer.discountPercentage) / 100
        );
    }

    return variantPrice;
}
