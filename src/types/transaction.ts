import { TOrder } from './order';
import { TUser } from './admin-user';

export type TTransaction = {
    trx_id: string;
    user?: TUser; // for guest user user_id will null
    trx_status: string;
    order: TOrder;
    payment_id: string;
    payment_date: Date;
    amount: number;
    currency: string;
    payment_by: string;
    message?: string;
    method: 'BKASH' | 'NAGAD';
};
