import { fileUrl } from '@/lib/file-url';

// export function getMediaUrl(key: any) {
//   if (!key) return "";

//   // Handle File/Blob objects for uploads
//   if (key instanceof Blob || key instanceof File) {
//     return URL.createObjectURL(key);
//   }

//   const trimmed = String(key).trim();
//   if (!trimmed) return "";

//   // If it's already a full URL (S3 or https) or a local blob string
//   if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:")) {
//     return trimmed;
//   }

//   // Fallback to Cloudfront for relative paths like "uploads/..."
//   return `https://d11ml80zmgyrxk.cloudfront.net/${trimmed}`;
// }

export function getMediaUrl(key: any) {
    // 1. Define the fallback path
    const FALLBACK_LOGO = '/logo/logo_icon_transparent.png';

    // If key is null or undefined, return fallback
    if (!key) return FALLBACK_LOGO;

    // Handle File/Blob objects (useful for image pickers/previews)
    if (key instanceof Blob || key instanceof File) {
        return URL.createObjectURL(key);
    }

    const trimmed = String(key).trim();

    // If the string is empty after trimming, return fallback
    if (!trimmed) return FALLBACK_LOGO;

    // 2. If it's already a full URL or a local blob string
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // 3. Optional: Check if it's already a local path
    if (trimmed.startsWith('/logo/') || trimmed.startsWith('/images/')) {
        return trimmed;
    }

    if (trimmed.includes('ibb.co')) {
        return FALLBACK_LOGO;
    }

    // Short paths from the backend ("uploads/<id>.jpg") → NEXT_PUBLIC_FILE_BASE_URL + path.
    return fileUrl(trimmed);

    // from mokkah fabrics
    //  return `https://d38ry6e5iuvq8e.cloudfront.net/${cleanPath}`;
}
