/** Product detail shapes used by the product page, product card and cart. */
export type Variant = {
    _id: string;
    attributes?: string[];
    attribute_values?: Record<string, string>;
    regular_price: number;
    sale_price?: number;
    sku?: string;
    image?: string;
};

export type ProductData = {
    _id: string;
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    thumbnail?: string;
    slider_images?: string[];
    short_videos?: {
        url: string;
        format?: string;
        ratio?: string;
        size?: number;
        thumbnail?: string;
        title?: string;
        duration?: number;
    }[];
    category?: {
        _id?: string;
        name?: string;
        name_en?: string;
        slug?: string;
    } | null;
    variants: Variant[];
    min_order_qty?: number;
    max_order_qty?: number;
    total_sold?: number;
    approximately_delivery_time?: string;
    is_free_delivery?: boolean;
    shipping_cost?: number;
    shipping_cost_per_unit?: number;
    warranty?: string;
    return_policy?: any;
    search_tags?: string[];
    offer_tags?: string[];
    highlight_labels?: string[];
    social_links?: { name?: string; url?: string }[];
    coin_per_order?: number;
    brand: {
        name: string;
    };
};
