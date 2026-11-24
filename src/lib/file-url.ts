/**
 * Turns a stored file path into a full URL.
 *
 * New uploads are saved as short paths ("uploads/<id>.jpg") and get
 * NEXT_PUBLIC_FILE_BASE_URL in front. Older records already hold full links
 * ("https://…"), which are returned as they are.
 *
 * Cloudinary serves images from ".../image/upload" and videos from
 * ".../video/upload". Set the image one in .env; video files are switched
 * to the video one here automatically.
 */
const FILE_BASE_URL = (
    process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL ||
    'https://d11ml80zmgyrxk.cloudfront.net'
).replace(/\/+$/, '');

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|mkv|avi|ogv|3gp)$/i;

/** True for "uploads/clip.mp4" and other video files. */
export const isVideoPath = (path: string) =>
    VIDEO_EXTENSIONS.test(path.split('?')[0]);

/** The base URL for this file (Cloudinary videos use /video/upload). */
const baseUrlFor = (path: string) => {
    if (isVideoPath(path))
        return FILE_BASE_URL.replace('/image/upload', '/video/upload');
    return FILE_BASE_URL;
};

export const fileUrl = (path: string) => {
    if (/^(https?:|blob:|data:)/i.test(path)) return path;

    const cleanPath = path.replace(/^\/+/, '');
    return `${baseUrlFor(cleanPath)}/${cleanPath}`;
};
