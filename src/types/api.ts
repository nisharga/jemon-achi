/** Standard envelope returned by the backend for every successful call. */
export interface IApiResponse<T> {
    success: boolean;
    statusCode?: number;
    message?: string;
    data: T;
}

/** Shape of list endpoints: `{ data: { data: T[], meta } }`. */
export interface IPaginatedData<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

/** Error body the backend sends for failed requests (validation, auth, …). */
export interface IApiErrorBody {
    success?: false;
    statusCode?: number;
    message?: string;
    errorMessages?: { path: string; message: string }[];
}
