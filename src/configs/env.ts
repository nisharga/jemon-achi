// All NEXT_PUBLIC_* environment variables are read here, once.

// Backend REST base, e.g. https://api.example.com/api/v1.
// NEXT_PUBLIC_BASE_SERVER_API is accepted too so the griipbuddy .env works as-is.
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_SERVER_API ||
    'http://localhost:8001/api/v1';
export const SITE_DOMAIN =
    process.env.NEXT_PUBLIC_SITE_DOMAIN || 'http://localhost:3000';
export const FILE_UPLOAD_API_KEY =
    process.env.NEXT_PUBLIC_FILE_UPLOAD_API_KEY || '';
// Site-specific Plausible script URL (e.g. https://plausible.io/js/pa-XXXXX.js).
// Leave empty to disable analytics.
export const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || '';
