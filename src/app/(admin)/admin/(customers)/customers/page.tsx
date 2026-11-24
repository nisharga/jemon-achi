'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    useGetAllCustomersQuery,
    useLazyGetAllCustomersQuery
} from '@/redux/admin/api/customer-api';
import { CustomersTable } from './_components/customers-table';
import Pagination from '@/components/shared/pagination';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { Button } from '@/components/ui/admin-button';
import { Download } from 'lucide-react';

const CustomersPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloadLoading, setDownloadLoading] = useState(false);

    // Refs
    const isDownloadingRef = useRef(false);

    // === API queries ===
    // For paginated display
    const { data, isLoading, isFetching } = useGetAllCustomersQuery({
        page,
        limit,
        role: 'USER',
        searchQuery
    });

    // Lazy query for downloading ALL customers
    const [triggerDownload] = useLazyGetAllCustomersQuery();

    const customers = data?.data?.data;
    const customersMeta = data?.data?.meta;

    // === paginations ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        setPage(1);
    }, [limit, searchQuery]);

    // === handle search ===
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // === handle download excel ===
    const handleDownloadExcel = async () => {
        if (isDownloadingRef.current) return;

        isDownloadingRef.current = true;
        setDownloadLoading(true);

        try {
            // Fetch ALL data for download (using large limit)
            const downloadResult = await triggerDownload({
                page: 1,
                limit: customersMeta?.total || 10000, // Get all customers at once
                role: 'USER',
                searchQuery
            });

            if (downloadResult.data) {
                let customersData;

                // Extract data based on your API response structure
                if (
                    downloadResult.data.data &&
                    Array.isArray(downloadResult.data.data.data)
                ) {
                    customersData = downloadResult.data.data.data;
                } else if (Array.isArray(downloadResult.data.data)) {
                    customersData = downloadResult.data.data;
                } else if (Array.isArray(downloadResult.data)) {
                    customersData = downloadResult.data;
                } else {
                    customersData = [];
                }

                if (customersData && customersData.length > 0) {
                    await generateExcel(customersData);
                } else {
                    alert('No customers data available to download');
                }
            } else {
                throw new Error('No data received for download');
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Error downloading Excel file: ' + (err as Error).message);
        } finally {
            isDownloadingRef.current = false;
            setDownloadLoading(false);
        }
    };

    // Generate Excel file
    // Generate Excel file
    // Generate Excel file
    const generateExcel = async (customersData: any[]) => {
        if (!customersData || customersData.length === 0) {
            alert('No customers data available to download');
            return;
        }

        // --- Headers for customers ---
        const headers = [
            'Sl No',
            'Full Name',
            'Phone Number',
            'Total Orders',
            'Completed Orders',
            'Cancelled Orders',
            'Returned Orders',
            'Incomplete Orders',
            'Available Coins',
            'Status',
            'User Type',
            'Verified Number',
            'Joined Date',
            'Last Updated'
        ];

        // Calculate totals
        const totalOrders = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.total_orders) || 0);
        }, 0);

        const completedOrders = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.completed_orders) || 0);
        }, 0);

        const cancelledOrders = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.cancelled_orders) || 0);
        }, 0);

        const returnedOrders = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.returned_orders) || 0);
        }, 0);

        const incompleteOrders = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.incomplete_orders) || 0);
        }, 0);

        const availableCoins = customersData.reduce((sum, customer) => {
            return sum + (Number(customer?.available_coins) || 0);
        }, 0);

        // --- Build sheet ---
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Create worksheet data row by row with formatting
        // Add headers first
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

        // Add data rows with serial numbers as text
        customersData.forEach((customer: any, index: number) => {
            const rowData = [
                (index + 1).toString(), // Convert to string to force left alignment
                customer?.full_name || 'N/A',
                customer?.phone_number || 'N/A',
                Number(customer?.total_orders) || 0,
                Number(customer?.completed_orders) || 0,
                Number(customer?.cancelled_orders) || 0,
                Number(customer?.returned_orders) || 0,
                Number(customer?.incomplete_orders) || 0,
                Number(customer?.available_coins) || 0,
                customer?.status || 'N/A',
                customer?.userType || 'N/A',
                customer?.is_verified_number ? 'Yes' : 'No',
                customer?.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString()
                    : 'N/A',
                customer?.updatedAt
                    ? new Date(customer.updatedAt).toLocaleDateString()
                    : 'N/A'
            ];

            XLSX.utils.sheet_add_aoa(ws, [rowData], {
                origin: `A${index + 2}`
            });
        });

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // A: Sl No (first column, leftmost)
            { wch: 25 }, // B: Full Name
            { wch: 15 }, // C: Phone Number
            { wch: 12 }, // D: Total Orders
            { wch: 15 }, // E: Completed Orders
            { wch: 15 }, // F: Cancelled Orders
            { wch: 15 }, // G: Returned Orders
            { wch: 15 }, // H: Incomplete Orders
            { wch: 15 }, // I: Available Coins
            { wch: 12 }, // J: Status
            { wch: 20 }, // K: User Type
            { wch: 15 }, // L: Verified Number
            { wch: 15 }, // M: Joined Date
            { wch: 15 } // N: Last Updated
        ];

        // Format serial number column as text with left alignment
        const lastDataRow = customersData.length + 1;

        // Apply left alignment to ALL serial number cells
        for (let R = 1; R <= lastDataRow; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R - 1, c: 0 }); // Column A
            if (!ws[cellAddress]) ws[cellAddress] = {};
            if (!ws[cellAddress].s) ws[cellAddress].s = {};

            // Set alignment for header (row 0) and data rows
            if (R === 1) {
                // Header styling
                ws[cellAddress].s = {
                    font: { bold: true },
                    alignment: { vertical: 'center', horizontal: 'left' }, // LEFT alignment
                    fill: { fgColor: { rgb: 'E0E0E0' } }
                };
            } else {
                // Data rows - force left alignment for serial numbers
                ws[cellAddress].s = {
                    alignment: { horizontal: 'left' }
                };

                // Also set the cell type to string explicitly
                ws[cellAddress].t = 's'; // 's' means string type
            }
        }

        // Add autofilter
        ws['!autofilter'] = { ref: `A1:N${lastDataRow}` };

        // --- Summary section ---
        const summaryStartRow = lastDataRow + 2;

        const summaryPairs: Array<[string, any]> = [
            ['Search Query', searchQuery || 'All'],
            ['Total Customers', customersData.length],
            ['Total Orders', totalOrders],
            ['Completed Orders', completedOrders],
            ['Cancelled Orders', cancelledOrders],
            ['Returned Orders', returnedOrders],
            ['Incomplete Orders', incompleteOrders],
            ['Total Available Coins', availableCoins],
            ['Generated At', new Date().toLocaleString()]
        ];

        // Add summary title
        XLSX.utils.sheet_add_aoa(ws, [['Customers Report Summary']], {
            origin: `A${summaryStartRow}`
        });

        // Add summary data
        summaryPairs.forEach(([key, value], index) => {
            XLSX.utils.sheet_add_aoa(ws, [[key, value]], {
                origin: `A${summaryStartRow + index + 2}`
            });
        });

        // Merge summary title
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
            s: { r: summaryStartRow - 1, c: 0 },
            e: { r: summaryStartRow - 1, c: 2 }
        });

        // Apply styling to other headers (columns B-N)
        const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:N1');
        for (let C = 1; C <= headerRange.e.c; ++C) {
            // Start from column B (index 1)
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = {};
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s = {
                font: { bold: true },
                alignment: { vertical: 'center', horizontal: 'center' },
                fill: { fgColor: { rgb: 'E0E0E0' } }
            };
        }

        // Style data rows for numeric columns (center align columns D-I)
        for (let R = 1; R <= customersData.length; ++R) {
            if (!ws['!rows']) ws['!rows'] = [];
            ws['!rows'][R] = { hpt: 18 };

            // Center align numeric columns (Total Orders to Available Coins)
            const numericCols = [3, 4, 5, 6, 7, 8]; // Columns D-I (0-based indices)
            numericCols.forEach((C) => {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) ws[cellAddress] = {};
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                ws[cellAddress].s.alignment = { horizontal: 'center' };
            });
        }

        // Set row height for header
        if (!ws['!rows']) ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 20 };

        // --- Finalize ---
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');

        const fileName = `customers_report_${new Date()
            .toLocaleDateString()
            .replace(/\//g, '-')}_${searchQuery ? 'search' : 'all'}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-medium'>All Customers</h1>

                    <div className='flex items-center justify-center gap-3'>
                        {/* Search Input */}
                        <div className='w-64'>
                            <input
                                type='text'
                                placeholder='Search customers...'
                                value={searchQuery}
                                onChange={handleSearch}
                                className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        {/* Download Button */}
                        <Button
                            onClick={handleDownloadExcel}
                            disabled={
                                downloadLoading ||
                                isLoading ||
                                !customersMeta?.total
                            }
                            variant='outline'
                            className='flex items-center'
                        >
                            <Download className='h-7 w-5' />
                            {downloadLoading
                                ? 'Downloading...'
                                : 'Download Excel'}
                        </Button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                    <div className='rounded-lg bg-blue-50 p-4'>
                        <div className='text-sm text-blue-600'>
                            Total Customers
                        </div>
                        <div className='text-2xl font-bold'>
                            {customersMeta?.total || 0}
                        </div>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4'>
                        <div className='text-sm text-green-600'>Active</div>
                        <div className='text-2xl font-bold'>
                            {customers?.filter(
                                (c: { status: string }) =>
                                    c?.status === 'ACTIVE'
                            ).length || 0}
                        </div>
                    </div>
                    <div className='rounded-lg bg-yellow-50 p-4'>
                        <div className='text-sm text-yellow-600'>Inactive</div>
                        <div className='text-2xl font-bold'>
                            {customers?.filter(
                                (c: { status: string }) =>
                                    c?.status === 'INACTIVE'
                            ).length || 0}
                        </div>
                    </div>
                    <div className='rounded-lg bg-purple-50 p-4'>
                        <div className='text-sm text-purple-600'>
                            Total Orders
                        </div>
                        <div className='text-2xl font-bold'>
                            {customers?.reduce(
                                (sum: any, c: { total_orders: any }) =>
                                    sum + (c?.total_orders || 0),
                                0
                            ) || 0}
                        </div>
                    </div>
                    <div className='rounded-lg bg-cyan-50 p-4'>
                        <div className='text-sm text-cyan-600'>POS Users</div>
                        <div className='text-2xl font-bold'>
                            {customers?.filter(
                                (c: { userType: string }) =>
                                    c?.userType === 'POS'
                            ).length || 0}
                        </div>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-4'>
                        <div className='text-sm text-orange-600'>APP Users</div>
                        <div className='text-2xl font-bold'>
                            {customers?.filter(
                                (c: { userType: string }) =>
                                    c?.userType === 'APP'
                            ).length || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* table */}
            <CustomersTable
                customers={customers}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            {/* pagination */}
            <div className='rounded-lg bg-background p-2 shadow-md'>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalItems={customersMeta?.total}
                />
            </div>
        </section>
    );
};

export default CustomersPage;
