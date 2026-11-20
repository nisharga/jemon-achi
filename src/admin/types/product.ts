import { TCategory } from './category';
import { TSubCategory } from './sub-category';

export type TVariantCombination = {
    available_quantity: number;
    _id: string;
    attribute_values: {
        [key: string]: string; // e.g., { Size: "M", Color: "Red" }
    };

    regular_price: number;
    sale_price: number;
    sku: string;
    barcode: string;
    //  available_quantity: number;
    image?: string; // optional: image for this variant
    color_code?: string; // optional: hex color code for this variant
};

export interface IProductSaleChannels {
    website?: boolean;
    pos?: boolean;
    [key: string]: boolean | undefined; // dynamic future channels
}

// Product-level short video (story / tiktok style clip)
export type TProductShortVideo = {
    url: string; // S3 key or full url
    format?: string; // e.g. "mp4", "webm"
    ratio?: string; // aspect ratio, e.g. "9:16"
    size?: number; // bytes
    thumbnail?: string; // optional poster
    title?: string; // optional caption
    duration?: number; // optional seconds
};

// Main Product interface
export type TProduct = {
    is_pre_order: any;
    product_type: any;
    ratings: any;
    _id: string;
    id: string;

    // Basic Info
    name: string;
    slug: string;
    description: string;
    sale_channels: IProductSaleChannels;
    sku?: string;

    // Images
    thumbnail: string;
    slider_images?: string[];

    // Short videos (story / tiktok style)
    short_videos?: TProductShortVideo[];

    // Stock & Order Constraints
    min_order_qty?: number;
    max_order_qty?: number;
    total_sold?: number;

    attributes: string[];
    variants: Array<{
        attributes: string[];
        attribute_values: Record<string, string>;
        regular_price: number;
        sale_price: number;
        sku: string;
        available_quantity: number;
        _id: string;
        color_code?: string; // optional: hex color code for this variant
    }>;

    // Delivery & Offers
    approximately_delivery_time: string; // default is "4 to 5 days"
    is_free_delivery?: boolean;
    coin_per_order?: number;
    shipping_cost?: number;
    shipping_cost_per_unit?: number;

    // Policy
    warranty?: string;
    return_policy?: IReturnPolicy;

    // Ratings & Reviews
    total_rating?: number;
    reviews?: {
        rating: number;
        comment: string;
        user: any;
        images?: string[];
    }[];

    // Tags
    search_tags?: string[];
    offer_tags?: string[];
    highlight_labels?: string[];

    // Social Links
    social_links?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };

    // Category Reference
    category: TCategory;
    subcategory: TSubCategory;
    sub_subcategory: any;
    brand?: {
        _id: string;
        name: string;
        tags: string[];
        is_active: boolean;
    };

    // Visibility
    is_published?: boolean;
    stocks?: any;

    createdAt: string;
    updatedAt: string;

    dynamic_specs: any;
    product_card_properties: any;
    product_specifications: any;
};

export type TProductInventory = {
    _id: string;
    product: string;
    attributes: string[];
    variants: Array<{
        attribute_values: Record<string, string>;
        regular_price: number;
        sale_price: number;
        sku: string;
        available_quantity: number;
        _id: string;
        color_code?: string; // optional: hex color code for this variant
    }>;
    outlet: null;
    warehouse: {
        _id: string;
        name: string;
        slug: string;
        location: {
            latitude: number;
            longitude: number;
            _id: string;
        };
        address: {
            division: string;
            district: string;
            thana: string;
            local_address: string;
            _id: string;
        };
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
};

// === warehouse ===
type Location = {
    latitude: number;
    longitude: number;
    _id: string;
};

type Address = {
    division: string;
    district: string;
    thana: string;
    local_address: string;
    _id: string;
};
export type TWarehouse = {
    _id: string;
    name: string;
    slug: string;
    location: Location;
    address: Address;
    type: 'WAREHOUSE';
    createdAt: string;
    updatedAt: string;
};

// === outlet ===
export type TOutlet = {
    _id: string;
    name: string;
    slug: string;
    type: 'OUTLET' | 'WAREHOUSE';
    location: Location;
    address: Address;
    createdAt: string;
    updatedAt: string;
};

// === invententory ===
export type TInventory = {
    _id: string;
    product: TProduct;
    attributes: string[];
    variants: TVariantCombination[];
    outlet: TOutlet | null;
    warehouse: TWarehouse | null;
    createdAt: string;
    updatedAt: string;
    color_code?: string; // optional: hex color code for inventory
};

export type IReturnPolicy = {
    title: string;
    slug: string;
    description: string;
    return_period_days: number;
    conditions: string[];
    is_active: boolean;
    _id?: string;
};
