// config.ts
export const API_BASE_URL: string =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://devapi.griipbuddy.com/api/v1';
export const FRONTEND_URL: string =
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export const HARD_USER_TOKEN: string =
    process.env.NEXT_PUBLIC_HARD_USER_TOKEN || 'qwqwqwe';

export const WHATSAPP_NUMBER: string =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+8801871087090';

export const BKASH_NUMBER: string =
    process.env.NEXT_PUBLIC_BKASH_NUMBER || '+8801871087090';

export const NAGAD_NUMBER: string =
    process.env.NEXT_PUBLIC_NAGAD_NUMBER || '+8801871087090';

// delivery charge values
export const DEFAULT_DELIVERY_PRICE: number = 80;
export const INSIDE_DHAKA_DELIVERY_PRICE: number = 50;
export const OUTSIDE_DHAKA_DELIVERY_PRICE: number = 80;
export const DEFAULT_LOCKED_AMOUNT: number = 80;

// clodfront base url
export const CLOUDFRONT_BASE_URL =
    process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL ||
    'https://d11ml80zmgyrxk.cloudfront.net';
// Analytics / marketing IDs (loaded by src/shop/components/shared/ThirdPartyScripts.tsx).
// The GTM id used to end in a stray quote ("GTM-KLT379P8'"), so GTM never matched a container.
export const GTM_ID = 'GTM-KLT379P8';
export const GA_ID = 'G-LJ4WTXYF3Y';
export const TRUSTPILOT_KEY = 'tkfiXgI7wiABpbkY';
export const PLAUSIBLE_DOMAIN = 'griipbuddy.com';
export const META_PIXEL_ID = '1570751320714912';
