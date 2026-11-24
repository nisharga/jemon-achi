import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getDiscountPercentage(regular: number, sale: number): string {
    if (regular === 0 || sale >= regular) return '0% OFF';
    const percent = ((regular - sale) / regular) * 100;
    return `${Math.round(percent)}% OFF`;
}

export function createImageArray(thumbnail: string, slider_images: string[]) {
    const allImages = [thumbnail, ...slider_images];
    return allImages.map((img, index) => ({
        id: index + 1,
        img
    }));
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'placed':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case 'processing':
            return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'shipped':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
        case 'delivered':
            return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'cancelled':
            return 'bg-red-100 text-red-800 hover:bg-red-100';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
};

export const getActualIndex = (
    indexWithinPage: number,
    currentPage: number,
    pageSize: number
): number => {
    return (currentPage - 1) * pageSize + indexWithinPage + 1;
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const calculateDiscount = (
    regularPrice: string | number,
    salePrice: string | number
): string => {
    const regular =
        typeof regularPrice === 'string'
            ? parseFloat(regularPrice)
            : regularPrice;
    const sale =
        typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;

    // Avoid division by zero and handle invalid numbers
    if (!regular || regular <= 0 || !sale || sale >= regular) {
        return '0%';
    }

    const discount = ((regular - sale) / regular) * 100;

    // Math.round to get a clean number like "22%"
    return `${Math.round(discount)}%`;
};

export const formatSlugToTitle = (slug: string): string => {
    if (!slug) return '';

    return slug
        .split('-') // Split by hyphen: ["perosnal", "computer"]
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each: ["Perosnal", "Computer"]
        .join(' '); // Join with space: "Perosnal Computer"
};

// src/lib/utils.ts
export const isDesktop =
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

// Format date function
export const formatTableDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const SORT_MAPPING: Record<string, any> = {
    Newest: { sortBy: 'createdAt', sortOrder: 'desc' },
    Popularity: {
        top_selling: true,
        sortBy: 'total_rating',
        sortOrder: 'desc'
    },
    Discount: { sortBy: 'price', sortOrder: 'asc' }, // Or whatever logic represents discount
    'Price: Low To High': { sortBy: 'price', sortOrder: 'asc' },
    'Price: High To Low': { sortBy: 'price', sortOrder: 'desc' }
};

export const slugToText = (slug: string): string => {
    if (!slug) return '';

    return slug
        .split(/[-_]+/) // Split by hyphens or underscores
        .map((word) => {
            // Capitalize the first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' '); // Join with a single space
};
