import { TSubCategory } from './sub-category';

export type TCategory = {
    name: string;
    _id: string;
    name_en: string;
    name_bn: string;
    description_en?: string;
    description_bn?: string;
    image_url?: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    subcategories: TSubCategory[];
    is_published: boolean;
    slug: string;
    media: {
        size: string;
        image: string;
        video: string;
    }[];
};
