export const formatDateForAPI = (date: Date) => {
    const dateObj = new Date(date);
    const year = dateObj?.getFullYear();
    const month = String(dateObj?.getMonth() + 1)?.padStart(2, '0');
    const day = String(dateObj?.getDate())?.padStart(2, '0');

    // Format as YYYY-MM-DD with Bangladesh timezone
    return `${year}-${month}-${day}T00:00:00+06:00`;
};
