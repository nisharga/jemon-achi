/* eslint-disable react-hooks/rules-of-hooks */
// hooks/useRepeatCustomers.ts
'use client';

import { useGetSingleRepeatCustomerByPhoneNumberQuery } from '@/redux/admin/api/repeat-customer-api';
import { useMemo } from 'react';

export const useRepeatCustomers = (phoneNumbers: string[]) => {
    // Create a memoized array of queries
    const queries = useMemo(() => {
        return phoneNumbers.map((phoneNumber) => ({
            phoneNumber,
            query: useGetSingleRepeatCustomerByPhoneNumberQuery(
                { phone_number: phoneNumber },
                { skip: !phoneNumber }
            )
        }));
    }, [phoneNumbers]);

    // Create a map of phone numbers to repeat customer status
    const repeatCustomersMap = useMemo(() => {
        const map: Record<string, boolean> = {};

        queries.forEach(({ phoneNumber, query }) => {
            if (
                phoneNumber &&
                query.data?.data?.is_repeat_customer !== undefined
            ) {
                map[phoneNumber] = query.data.data.is_repeat_customer;
            }
        });

        return map;
    }, [queries]);

    // Calculate loading state
    const isLoading = useMemo(() => {
        return queries.some((query) => query.query.isLoading);
    }, [queries]);

    return {
        repeatCustomersMap,
        isLoading
    };
};
