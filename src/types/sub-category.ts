import { TCategory } from './category';

export type TSubCategory = {
    name: string;
    _id: string;
    name_en: string;
    name_bn: string;
    description_en?: string;
    description_bn?: string;
    image_url?: string;
    position: number;
    category?: TCategory;
    createdAt: Date;
    updatedAt: Date;
    sub_subcategories: {
        name: string;
        _id: string;
        name_en: string;
        name_bn: string;
        description_en?: string;
        description_bn?: string;
        image_url?: string;
        position: number;
        category?: TCategory;
        createdAt: Date;
        updatedAt: Date;
    }[];
    media: {
        size: string;
        image: string;
        video: string;
    }[];
};
