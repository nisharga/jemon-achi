import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// export function getImgFullUrl(key: string) {
//  if (!key) return "";

//  const trimmed = key.trim();
//  if (!trimmed) return "";

//  // ✅ http / https url (already full url)
//  if (/^https?:\/\//i.test(trimmed)) return trimmed;

//  // ✅ blob url (local preview)
//  if (trimmed.startsWith("blob:")) return trimmed;

//  return `https://d11ml80zmgyrxk.cloudfront.net/${trimmed}`;
// }

export function getImgFullUrl(key: any) {
    // 1. Guard against null or undefined
    if (!key) return '';

    // 2. If it's a File/Blob object (from an upload input), create a preview URL
    if (key instanceof Blob || key instanceof File) {
        return URL.createObjectURL(key);
    }

    // 3. Ensure we are working with a string for the remaining logic
    const trimmed = String(key).trim();
    if (!trimmed) return '';

    // ✅ http / https url (already full url)
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // ✅ blob url string (already a local preview string)
    if (trimmed.startsWith('blob:')) return trimmed;

    // ✅ Cloudfront path
    return `https://d11ml80zmgyrxk.cloudfront.net/${trimmed}`;
}

// export function getImgFullUrl(key: any) {
//   // 1. Check if key exists and convert to string to be safe
//   if (key === null || key === undefined) return "";

//   // 2. Coerce to string in case a number or object was passed
//   const keyString = String(key).trim();

//   if (!keyString) return "";

//   // ✅ http / https url (already full url)
//   if (/^https?:\/\//i.test(keyString)) return keyString;

//   // ✅ blob url (local preview)
//   if (keyString.startsWith("blob:")) return keyString;

//   return `https://d11ml80zmgyrxk.cloudfront.net/${keyString}`;
// }
