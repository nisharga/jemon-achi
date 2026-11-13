import type { IApiErrorBody } from '@/types/api';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const isFetchError = (error: unknown): error is FetchBaseQueryError =>
    typeof error === 'object' && error !== null && 'status' in error;

/**
 * Turns an RTK Query error into a single human-readable string.
 * Handles the backend's `{ message, errorMessages: [{ path, message }] }` shape,
 * network failures, and serialized JS errors.
 */
export const getApiErrorMessage = (
    error: unknown,
    fallback: string = DEFAULT_MESSAGE
): string => {
    if (isFetchError(error)) {
        if (error.status === 'FETCH_ERROR') {
            return 'Cannot reach the server. Check your connection.';
        }
        const body = error.data as IApiErrorBody | string | undefined;
        if (typeof body === 'string' && body) return body;
        if (body && typeof body === 'object') {
            const messages = body.errorMessages
                ?.map((e) => e.message)
                .filter(Boolean);
            if (messages?.length) return messages.join('\n');
            if (body.message) return body.message;
        }
        return fallback;
    }

    const serialized = error as SerializedError | undefined;
    return serialized?.message || fallback;
};

/** HTTP status of an RTK Query error, if it has one. */
export const getApiErrorStatus = (error: unknown): number | undefined =>
    isFetchError(error) && typeof error.status === 'number'
        ? error.status
        : undefined;
