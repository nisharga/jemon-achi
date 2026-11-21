export const ENV = {
    NEXT_PUBLIC_BASE_SERVER_API:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_SERVER_API ||
        'http://localhost:5007/api/v1',
    NEXT_PUBLIC_FILE_UPLOAD_API_KEY: process.env.NEXT_PUBLIC_FILE_UPLOAD_API_KEY
} as const;
