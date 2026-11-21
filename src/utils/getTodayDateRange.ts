import { endOfDay, startOfDay } from 'date-fns';

export const getTodayDateRange = () => {
    const today = new Date();
    return {
        from: startOfDay(today),
        to: endOfDay(today)
    };
};
