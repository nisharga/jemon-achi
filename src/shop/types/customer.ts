// Shapes returned by the customer API (`/customer/*` and `/order/customer/*`).
// Every response is wrapped as `{ success, message, data }`.

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

/** A logged-in shop customer (GET /customer/me). */
export type Customer = {
    _id: string;
    full_name: string;
    phone_number: string;
    email: string | null;
    gender: string | null;
    address: string | null;
    profile_url: string | null;
    createdAt: string;
};

/** Reply of POST /customer/otp/send. */
export type SendOtpResult = {
    phone_number: string;
    /** Seconds until the code stops working. */
    expires_in: number;
    /** Seconds until a new code may be requested. */
    resend_in: number;
    /** Only sent by the backend in development, so we can log in without SMS. */
    dev_otp?: string;
};

/** Reply of POST /customer/otp/verify. */
export type LoginResult = {
    access_token: string;
    refresh_token: string;
    user: Customer;
};

/** Reply of POST /customer/refresh-token. */
export type RefreshResult = {
    access_token: string;
    refresh_token: string;
};

/** Fields a customer may change on their profile. */
export type UpdateProfileInput = {
    full_name: string;
    email: string;
};

/** One product line inside an order. */
export type OrderItem = {
    _id: string;
    product?: {
        _id: string;
        name: string;
        slug?: string;
        thumbnail?: string;
    };
    total_quantity: number;
    total_price: number;
    selected_variant?: {
        attribute_values?: Record<string, string>;
    };
};

/** A customer's order (only the fields the dashboard shows). */
export type Order = {
    _id: string;
    order_serial_id: number;
    invoice_number?: string;
    status: string;
    order_date?: string;
    createdAt?: string;
    products: OrderItem[];
    customer_name: string;
    customer_phone: string;
    delivery_address?: {
        division?: string;
        district?: string;
        thana?: string;
        address?: string;
    };
    payment_type?: 'CASH_ON_DELIVERY' | 'FULL_PAYMENT';
    sub_total: number;
    delivery_charge: number;
    total_discount: number;
    total_amount: number;
    paid_amount?: number;
    tracking_code?: string;
};

export type PageInfo = {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
};

/** Reply of GET /order/customer/my-order. */
export type OrderList = {
    data: Order[];
    meta: PageInfo;
};
