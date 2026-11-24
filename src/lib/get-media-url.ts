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

// export function getMediaUrl(key: any) {
//   if (!key) return "";

//   // 1. Handle File/Blob objects for uploads
//   if (key instanceof Blob || key instanceof File) {
//     return URL.createObjectURL(key);
//   }

//   const trimmed = String(key).trim();
//   if (!trimmed) return "";

//   // 2. If it's a full URL (ImgBB, S3, etc.) or a browser blob
//   if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:")) {
//     return trimmed;
//   }

//   // 3. CHECK FOR LOCAL IMAGES:
//   // If the path starts with common local folders, return it as-is
//   if (trimmed.startsWith("/logo/") || trimmed.startsWith("/images/") || trimmed.startsWith("/public/")) {
//     return trimmed;
//   }

//   // 4. Fallback to Cloudfront for relative paths (and fix double slash)
//   const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
//   return `https://d11ml80zmgyrxk.cloudfront.net/${cleanPath}`;
// }

export function getMediaUrl(key: any) {
    // 1. Set your fallback logo path here
    const FALLBACK_LOGO = '/logo/logo.png';

    if (!key) return FALLBACK_LOGO;

    if (key instanceof Blob || key instanceof File) {
        return URL.createObjectURL(key);
    }

    const trimmed = String(key).trim();
    if (!trimmed) return FALLBACK_LOGO;

    // 2. EMERGENCY CHECK: If ImgBB is down, redirect those requests to local logo
    if (trimmed.includes('ibb.co')) {
        return FALLBACK_LOGO;
    }

    // 3. If it's a full URL (Other sites, S3, etc.)
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // 4. CHECK FOR LOCAL IMAGES
    if (
        trimmed.startsWith('/logo/') ||
        trimmed.startsWith('/images/') ||
        trimmed.startsWith('/public/')
    ) {
        return trimmed;
    }

    // Short paths from the backend ("uploads/<id>.jpg") → NEXT_PUBLIC_FILE_BASE_URL + path.
    return fileUrl(trimmed);

    // from mokkah fabrics
    //  return `https://d38ry6e5iuvq8e.cloudfront.net/${cleanPath}`;
}
