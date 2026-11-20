import { useGetCmsOfferQuery } from '@/shop/redux/api/offer';

const DEFAULT_RETURN = {
    newPrice: 0,
    offerLabel: null,
    isOfferApplied: false,
    isLoadingOffer: false,
    specialSaleActive: false,
    discountPercentage: 0
};

export const useProductOffer = (
    categoryId: string | undefined,
    originalPrice: number
) => {
    const { data: offerData, isLoading: isLoadingOffer } = useGetCmsOfferQuery(
        {}
    );
    const offer = offerData?.data;

    // 1. No offer or sale inactive → early return with all keys present
    if (!offer || !offer.specialSaleActive) {
        return {
            ...DEFAULT_RETURN,
            newPrice: originalPrice,
            isLoadingOffer,
            specialSaleActive: offer?.specialSaleActive ?? false
        };
    }

    const {
        offer_start_date,
        validFor,
        discountPercentage,
        applied_subcategories,
        navbar_label,
        specialSaleActive
    } = offer;

    // 2. Date validation (UTC-safe)
    const now = Date.now();
    const startDate = new Date(offer_start_date).getTime();
    const expiryDate = startDate + validFor * 24 * 60 * 60 * 1000;
    const isDateValid = now >= startDate && now <= expiryDate;

    // 3. Category validation — guard if categoryId is undefined
    const isCategoryEligible =
        !!categoryId &&
        applied_subcategories?.some((cat: any) => cat._id === categoryId);

    // 4. Final calculation
    const isOfferApplied = isDateValid && isCategoryEligible;

    const newPrice = isOfferApplied
        ? Math.round(originalPrice - (originalPrice * discountPercentage) / 100)
        : originalPrice;

    return {
        newPrice,
        offerLabel: isOfferApplied ? navbar_label : null,
        isOfferApplied,
        isLoadingOffer,
        specialSaleActive,
        discountPercentage: isOfferApplied ? discountPercentage : 0
    };
};

// import { useGetCmsOfferQuery } from "@/shop/redux/api/offer";

// export const useProductOffer = (categoryId: string, originalPrice: number) => {
//   const { data: offerData, isLoading: isLoadingOffer } = useGetCmsOfferQuery({});
//   const offer = offerData?.data;
//   console.log('offer: ', offer);

//   // 1. If offer doesn't exist yet or is loading, return defaults
//   if (!offer || !offer.specialSaleActive) {
//     return {
//       newPrice: originalPrice,
//       offerLabel: null,
//       isOfferApplied: false,
//       isLoadingOffer,
//       specialSaleActive: offer?.specialSaleActive || false,
//     };
//   }

//   const {
//     offer_start_date,
//     validFor,
//     discountPercentage,
//     applied_subcategories,
//     navbar_label,
//     specialSaleActive,
//   } = offer;

//   // 2. Date Validation
//   const startDate = new Date(offer_start_date);
//   const currentDate = new Date();
//   const expiryDate = new Date(startDate);
//   expiryDate.setDate(startDate.getDate() + validFor);

//   const isDateValid = currentDate >= startDate && currentDate <= expiryDate;

//   // 3. Category Validation
//   const isCategoryEligible = applied_subcategories?.some(
//     (cat: any) => cat._id === categoryId
//   );

//   // 4. Final Calculation
//   const isOfferApplied = isDateValid && isCategoryEligible;

//   const calculatedPrice = isOfferApplied
//     ? Math.round(originalPrice - (originalPrice * discountPercentage) / 100)
//     : originalPrice;

//   return {
//     newPrice: calculatedPrice,
//     offerLabel: isOfferApplied ? navbar_label : null,
//     isOfferApplied,
//     isLoadingOffer,
//     specialSaleActive, // This lets you check if a sale exists globally
//     discountPercentage
//   };
// };
