// Category data used by the header menus (GET /category/published/all).

export type NavSubSubCategory = { _id: string; name_en: string; slug: string };

export type NavSubCategory = {
    _id: string;
    name_en: string;
    slug: string;
    sub_subcategories?: NavSubSubCategory[];
};

export type NavCategory = {
    _id: string;
    name_en: string;
    slug: string;
    is_published?: boolean;
    subcategories?: NavSubCategory[];
};
