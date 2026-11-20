// write internal navigation routes paths here...
export const routes = {
    /** Storefront home (the shop lives at the root). */
    base: '/',
    landing: '/landing',
    contactUs: '/landing/contact-us',
    blogs: '/landing/blog',
    // Storefront customer pages (src/app/(shop)).
    login: '/login',
    register: '/register',
    profile: '/profile',
    adminLogin: '/admin-login',
    admin: {
        base: '/admin'
    }
} as const;
