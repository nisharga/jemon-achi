// Public storefront data (see src/shop/server/storefront-api.ts).

/** An image of a category or subcategory, in one of several shapes. */
export type CategoryMedia = {
    image?: string;
    size?: 'VERTICAL' | 'HORIZONTAL' | 'SQUARE' | string;
};

export type SubCategory = {
    _id: string;
    name_en: string;
    slug: string;
    media?: CategoryMedia[];
};

export type ProductCategory = {
    _id: string;
    name_en: string;
    slug: string;
    media?: CategoryMedia[];
    subcategories?: SubCategory[];
};

/** The few product fields a product card needs. */
export type ProductSummary = {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    variants?: { regular_price?: number; sale_price?: number }[];
};

/** The product fields its page shows before the interactive part loads. */
export type ProductDetailData = ProductSummary & {
    description?: string;
    search_tags?: string[];
    slider_images?: string[];
    min_price?: number;
    category?: { name_en: string; slug: string } | null;
};

export type HeroSlide = {
    _id?: string;
    title?: string;
    video_url?: string;
    thumbnail_url?: string;
    button?: {
        enabled?: boolean;
        text?: string;
        redirect_route?: string;
    };
};

export type HomePageContent = {
    best_selling?: { _id: string; product_id: ProductSummary | null }[];
};
