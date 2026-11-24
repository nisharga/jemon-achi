import type { Icons } from '@/shop/components/global/Icons';

// Content of the site footer (src/shop/components/shared/footer).

export type FooterLink = { name: string; url: string };

export const QUICK_LINKS: FooterLink[] = [
    { name: 'About Us', url: '/about-us' },
    { name: 'Contact Support', url: '/contact-and-support' },
    { name: 'Shipping Procedure', url: '/shipping-procedure' },
    { name: 'Order Tracking', url: '/track' },
    { name: 'Warranty policy', url: '/warranty-policy' },
    { name: 'Returns & Exchange', url: '/returns-and-exchange' }
];

export const SHOP_LINKS: FooterLink[] = [
    { name: 'iPhone Cases', url: '#' },
    { name: 'Samsung Cases', url: '#' },
    { name: 'Google Pixel Cases', url: '#' },
    { name: 'AirPods Cases', url: '#' },
    { name: 'Accessories', url: '#' },
    { name: 'Gift Cards', url: '#' }
];

export const COMPANY_LINKS: FooterLink[] = [
    { name: 'About', url: '#' },
    { name: 'Sustainability', url: '#' },
    { name: 'Customer Reviews', url: '#' },
    { name: 'Blog', url: '#' },
    { name: 'Refer a friend', url: '#' }
];

export const STYLE_LINKS: FooterLink[] = [
    { name: 'Ultra Protective Cases', url: '#' },
    { name: 'MagSafe Compatible', url: '#' },
    { name: 'Marble Cases', url: '#' },
    { name: 'Floral Cases', url: '#' },
    { name: 'Clear Cases', url: '#' }
];

export const LEGAL_LINKS: FooterLink[] = [
    { name: 'Privacy Policy', url: '/privacy-and-policy' },
    { name: 'Terms & Conditions', url: '/terms-and-conditions' }
];

/** `name` is what screen readers announce for the icon-only link. */
export const SOCIAL_LINKS: {
    name: string;
    url: string;
    icon: keyof typeof Icons;
}[] = [
    {
        name: 'Facebook',
        url: 'https://www.facebook.com/griipbuddy',
        icon: 'Facebook'
    },
    {
        name: 'Facebook group',
        url: 'https://www.facebook.com/groups/393533843391046',
        icon: 'FacebookGroup'
    },
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/griipbuddy',
        icon: 'Instagram'
    },
    {
        name: 'YouTube',
        url: 'https://www.youtube.com/@griipbuddy',
        icon: 'Youtube'
    },
    {
        name: 'TikTok',
        url: 'https://www.tiktok.com/@griip_buddy',
        icon: 'Tiktok'
    },
    {
        name: 'Amazon store',
        url: 'https://www.amazon.com/sp/redirect/storefront?seller=griipbuddy',
        icon: 'Amazon'
    }
];
