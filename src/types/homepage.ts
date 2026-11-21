// Homepage Management Types

// Shop by Category Item
export type TShopByCategoryItem = {
    _id?: string;
    category_id: string;
    subcategory_id?: string;
    icon_image_url?: string;
    position: number;
    label?: string;
};

// Best Selling Item
export type TBestSellingItem = {
    _id?: string;
    product_id: string;
    position: number;
};

// New Arrivals Group
export type TNewArrivalGroup = {
    _id?: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    position: number;
    product_ids: string[];
};

// Leather Section
export type TLeatherSection = {
    enabled: boolean;
    title: string;
    subtitle?: string;
    button_text: string;
    button_link: string;
    banner_image_url?: string;
    position: number;
    product_ids: string[];
};

// Homepage Management Main Interface
export type IHomepageManagement = {
    shop_by_category: TShopByCategoryItem[];
    best_selling: TBestSellingItem[];
    new_arrivals: TNewArrivalGroup[];
    leather_section: TLeatherSection;
};
