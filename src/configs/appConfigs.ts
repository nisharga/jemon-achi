import { Be_Vietnam_Pro } from 'next/font/google';

export const SITE_TITLE_DEFAULT = 'TruUp: Automated MSP Billing Reconciliation';
export const SITE_TITLE_TEMPLATE_DEFAULT = `%s - TruUp`;
export const SITE_DESCRIPTION_DEFAULT =
    'TruUp offers automated software billing reconciliation for MSPs, ensuring accurate payments and transparent transactions through seamless integrations.';
export const SITE_VERIFICATION_GOOGLE_DEFAULT =
    'google-site-verification=adwdawdaw';

export const FONT_DEFAULT = Be_Vietnam_Pro({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-be-vietnam-pro',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});
