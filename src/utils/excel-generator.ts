// import * as XLSX from "xlsx";

// export const generateExcel = async (
//   data: any,
//   businessLocationData: any,
//   businessLocation: string | null
// ) => {
//   const allStocks = data?.data || [];
//   const stocksReportInside = data?.summation || {};

//   if (!allStocks.length) return;

//   // --- resolve business location name ---
//   const businessLocations = businessLocationData?.data?.businessLocations ?? [];
//   const selectedLoc = businessLocations.find(
//     (loc: any) => String(loc?._id) === String(businessLocation)
//   );
//   const locationNameForExcel = selectedLoc?.name || "All";

//   // --- headers & rows (same columns as UI/PDF + Location) ---
//   const headers = [
//     "Product Name",
//     "SKU",
//     "Location",
//     // "Avg Purchase Price (Tk)",
//     "Sale Price (Tk)",
//     "Available Qty (Pair/pcs)",
//     // "Current Stock Purchase Value (Tk)",
//     "Potential Sale Value (Tk)",
//     "Potential Profit (Tk)",
//     "Total Sold (Pair/pcs)",
//   ];

//   const rows = allStocks.map((inventory: any) => {
//     const variant = Object.entries(inventory?.attribute_values || {})
//       .map(([, v]) => v)
//       .join("-");

//     const nameWithVariant = `${inventory?.product?.name ?? ""} (${variant})`;
//     const sku = inventory?.sku ?? "-";

//     const avgPurchase = Number(inventory?.avg_purchase_price) || 0;
//     const salePrice = Number(inventory?.sale_price) || 0;
//     const availableQty = Number(inventory?.available_quantity) || 0;
//     const totalSold = Number(inventory?.total_sold) || 0;

//     const currentStockPurchaseValue = Math.floor(availableQty * avgPurchase);
//     const potentialSaleValue = Math.floor(availableQty * salePrice);
//     const potentialProfit = potentialSaleValue - currentStockPurchaseValue;

//     return [
//       nameWithVariant,
//       sku,
//       locationNameForExcel,
//       Math.round(avgPurchase),
//       salePrice,
//       availableQty,
//       currentStockPurchaseValue,
//       potentialSaleValue,
//       potentialProfit,
//       totalSold,
//     ];
//   });

//   // --- build sheet ---
//   const wb = XLSX.utils.book_new();
//   const wsData = [headers, ...rows];
//   const ws = XLSX.utils.aoa_to_sheet(wsData);

//   // widths
//   ws["!cols"] = [
//     { wch: 60 },
//     { wch: 18 },
//     { wch: 22 },
//     // { wch: 18 },
//     { wch: 16 },
//     { wch: 20 },
//     // { wch: 26 },
//     { wch: 22 },
//     { wch: 18 },
//     { wch: 20 },
//   ];

//   // --- totals row (with formulas) ---
//   const firstDataRow = 2;
//   const lastDataRow = rows.length + 1;
//   const totalsRow = lastDataRow + 1;

//   // label
//   ws[`A${totalsRow}`] = { t: "s", v: "TOTALS" };
//   // sums
//   ws[`F${totalsRow}`] = { f: `SUM(F${firstDataRow}:F${lastDataRow})` };
//   ws[`G${totalsRow}`] = { f: `SUM(G${firstDataRow}:G${lastDataRow})` };
//   ws[`H${totalsRow}`] = { f: `SUM(H${firstDataRow}:H${lastDataRow})` };
//   ws[`I${totalsRow}`] = { f: `SUM(I${firstDataRow}:I${lastDataRow})` };
//   ws[`J${totalsRow}`] = { f: `SUM(J${firstDataRow}:J${lastDataRow})` };

//   // make sure the sheet range includes the totals row
//   {
//     const range = XLSX.utils.decode_range(ws["!ref"]!);
//     range.e.r = Math.max(range.e.r, totalsRow - 1);
//     ws["!ref"] = XLSX.utils.encode_range(range);
//   }

//   // keep autofilter limited to data
//   const lastCol = XLSX.utils.encode_col(headers.length - 1);
//   ws["!autofilter"] = { ref: `A1:${lastCol}${lastDataRow}` };

//   // --- summary block under totals (same sheet) ---
//   const gapRow = totalsRow + 1;
//   const summaryStartRow = gapRow + 1;

//   const summaryPairs: Array<[string, any]> = [
//     ["Business Location", locationNameForExcel],
//     ["Total SKU", stocksReportInside?.total_products ?? 0],
//     ["Total Available Qty", stocksReportInside?.total_available_quantity ?? 0],
//     [
//       "Current Stock Value (by purchase rate, Tk)",
//       Math.floor(
//         Number(stocksReportInside?.total_current_stock_purchase_value) || 0
//       ),
//     ],
//     [
//       "Potential Sale Value (Tk)",
//       Math.floor(Number(stocksReportInside?.total_sale_value) || 0),
//     ],
//     [
//       "Potential Profit Value (Tk)",
//       Math.floor(Number(stocksReportInside?.total_sale_value) || 0) -
//         Math.floor(
//           Number(stocksReportInside?.total_current_stock_purchase_value) || 0
//         ),
//     ],
//     [
//       "Total Sold Value (Tk)",
//       Math.floor(Number(stocksReportInside?.total_sold_value) || 0),
//     ],
//     ["Generated At", new Date().toLocaleString()],
//   ];

//   // title "Summary" on same sheet
//   ws[`A${summaryStartRow - 1}`] = { t: "s", v: "Summary" };

//   // write summary
//   summaryPairs.forEach(([k, v], i) => {
//     ws[`A${summaryStartRow + i}`] = { t: "s", v: k };
//     ws[`B${summaryStartRow + i}`] =
//       typeof v === "number" ? { t: "n", v } : { t: "s", v: String(v) };
//   });

//   // extend range to cover summary rows
//   {
//     const range = XLSX.utils.decode_range(ws["!ref"]!);
//     range.e.r = Math.max(range.e.r, summaryStartRow + summaryPairs.length - 1);
//     range.e.c = Math.max(range.e.c, 1);
//     ws["!ref"] = XLSX.utils.encode_range(range);
//   }

//   // merge summary title
//   ws["!merges"] = (ws["!merges"] || []).concat([
//     XLSX.utils.decode_range(`A${summaryStartRow - 1}:B${summaryStartRow - 1}`),
//   ]);

//   // --- finalize ---
//   XLSX.utils.book_append_sheet(wb, ws, "Stocks");

//   const fileName = `stocks_report_${new Date()
//     .toLocaleDateString()
//     .replace(/\//g, "-")}.xlsx`;
//   XLSX.writeFile(wb, fileName);
// };

import * as XLSX from 'xlsx';

export const generateExcel = async (
    data: any,
    businessLocationData: any,
    businessLocation: string | null
) => {
    const allStocks = data?.data || [];
    const stocksReportInside = data?.summation || {};

    if (!allStocks.length) return;

    // --- resolve business location name ---
    const businessLocations =
        businessLocationData?.data?.businessLocations ?? [];
    const selectedLoc = businessLocations.find(
        (loc: any) => String(loc?._id) === String(businessLocation)
    );
    const locationNameForExcel = selectedLoc?.name || 'All';

    // --- headers & rows (consistent with comments - remove purchase price columns) ---
    const headers = [
        'Product Name',
        'SKU',
        'Location',
        // REMOVED: "Avg Purchase Price (Tk)",
        'Sale Price (Tk)',
        'Available Qty (Pair/pcs)',
        // REMOVED: "Current Stock Purchase Value (Tk)",
        'Potential Sale Value (Tk)',
        'Potential Profit (Tk)',
        'Total Sold (Pair/pcs)'
    ];

    const rows = allStocks.map((inventory: any) => {
        const variant = Object.entries(inventory?.attribute_values || {})
            .map(([, v]) => v)
            .join('-');

        const nameWithVariant = `${inventory?.product?.name ?? ''} (${variant})`;
        const sku = inventory?.sku ?? '-';

        const avgPurchase = Number(inventory?.avg_purchase_price) || 0;
        const salePrice = Number(inventory?.sale_price) || 0;
        const availableQty = Number(inventory?.available_quantity) || 0;
        const totalSold = Number(inventory?.total_sold) || 0;

        const currentStockPurchaseValue = Math.floor(
            availableQty * avgPurchase
        );
        const potentialSaleValue = Math.floor(availableQty * salePrice);
        const potentialProfit = potentialSaleValue - currentStockPurchaseValue;

        return [
            nameWithVariant,
            sku,
            locationNameForExcel,
            // REMOVED: Math.round(avgPurchase), // Purchase price column removed
            salePrice,
            availableQty,
            // REMOVED: currentStockPurchaseValue, // Purchase value column removed
            potentialSaleValue,
            potentialProfit,
            totalSold
        ];
    });

    // --- build sheet ---
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Updated widths (removed purchase price columns)
    ws['!cols'] = [
        { wch: 60 }, // Product Name
        { wch: 25 }, // SKU
        { wch: 35 }, // Location
        // REMOVED: { wch: 18 }, // Avg Purchase Price
        { wch: 16 }, // Sale Price
        { wch: 20 }, // Available Qty
        // REMOVED: { wch: 26 }, // Current Stock Purchase Value
        { wch: 22 }, // Potential Sale Value
        { wch: 18 }, // Potential Profit
        { wch: 20 } // Total Sold
    ];

    // --- totals row (with formulas) ---
    const firstDataRow = 5; // 0-indexed (Excel row 6)
    const lastDataRow = firstDataRow + rows.length - 1;
    const totalsRow = lastDataRow + 1;

    // label
    ws[`A${totalsRow}`] = { t: 's', v: 'TOTALS' };
    // sums (note: column indices updated after removing purchase columns)
    // F is now Available Qty (previously G)
    // G is now Potential Sale Value (previously H)
    // H is now Potential Profit (previously I)
    // I is now Total Sold (previously J)

    // Available Qty sum
    ws[`F${totalsRow}`] = { f: `SUM(F${firstDataRow}:F${lastDataRow})` };
    // Potential Sale Value sum
    ws[`G${totalsRow}`] = { f: `SUM(G${firstDataRow}:G${lastDataRow})` };
    // Potential Profit sum
    ws[`H${totalsRow}`] = { f: `SUM(H${firstDataRow}:H${lastDataRow})` };
    // Total Sold sum
    ws[`I${totalsRow}`] = { f: `SUM(I${firstDataRow}:I${lastDataRow})` };

    // make sure the sheet range includes the totals row
    {
        const range = XLSX.utils.decode_range(ws['!ref']!);
        range.e.r = Math.max(range.e.r, totalsRow - 1);
        ws['!ref'] = XLSX.utils.encode_range(range);
    }

    // keep autofilter limited to data
    const lastCol = XLSX.utils.encode_col(headers.length - 1);
    ws['!autofilter'] = { ref: `A1:${lastCol}${lastDataRow}` };

    // --- summary block under totals (same sheet) ---
    const gapRow = totalsRow + 1;
    const summaryStartRow = gapRow + 1;

    const summaryPairs: Array<[string, any]> = [
        ['Business Location', locationNameForExcel],
        ['Total SKU', stocksReportInside?.total_products ?? 0],
        [
            'Total Available Qty',
            stocksReportInside?.total_available_quantity ?? 0
        ],
        [
            'Current Stock Value (by purchase rate, Tk)',
            Math.floor(
                Number(
                    stocksReportInside?.total_current_stock_purchase_value
                ) || 0
            )
        ],
        [
            'Potential Sale Value (Tk)',
            Math.floor(Number(stocksReportInside?.total_sale_value) || 0)
        ],
        [
            'Potential Profit Value (Tk)',
            Math.floor(Number(stocksReportInside?.total_sale_value) || 0) -
                Math.floor(
                    Number(
                        stocksReportInside?.total_current_stock_purchase_value
                    ) || 0
                )
        ],
        [
            'Total Sold Value (Tk)',
            Math.floor(Number(stocksReportInside?.total_sold_value) || 0)
        ],
        ['Generated At', new Date().toLocaleString()]
    ];

    // title "Summary" on same sheet
    ws[`A${summaryStartRow - 1}`] = { t: 's', v: 'Summary' };

    // write summary
    summaryPairs.forEach(([k, v], i) => {
        ws[`A${summaryStartRow + i}`] = { t: 's', v: k };
        ws[`B${summaryStartRow + i}`] =
            typeof v === 'number' ? { t: 'n', v } : { t: 's', v: String(v) };
    });

    // extend range to cover summary rows
    {
        const range = XLSX.utils.decode_range(ws['!ref']!);
        range.e.r = Math.max(
            range.e.r,
            summaryStartRow + summaryPairs.length - 1
        );
        range.e.c = Math.max(range.e.c, 1);
        ws['!ref'] = XLSX.utils.encode_range(range);
    }

    // merge summary title
    ws['!merges'] = (ws['!merges'] || []).concat([
        XLSX.utils.decode_range(
            `A${summaryStartRow - 1}:B${summaryStartRow - 1}`
        )
    ]);

    // Apply formatting to numeric columns
    const numericColumns = [4, 6, 7, 8]; // Sale Price (D), Potential Sale Value (G), Potential Profit (H), Total Sold (I)
    // Note: Column indices in ExcelJS are 1-based for columns, but our array indices are 0-based

    // Format all rows including header and data
    for (let r = 1; r <= lastDataRow; r++) {
        numericColumns.forEach((colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: r - 1, c: colIndex }); // Convert to 0-based for XLSX
            const cell = ws[cellRef];
            if (cell && cell.t !== 's' && cell.v !== undefined) {
                // Format as number with thousand separators
                if (!cell.z) {
                    cell.z = '#,##0';
                }
            }
        });
    }

    // Format summary numbers
    summaryPairs.forEach(([, v], i) => {
        if (typeof v === 'number') {
            const cellRef = XLSX.utils.encode_cell({
                r: summaryStartRow + i,
                c: 1
            });
            const cell = ws[cellRef];
            if (cell) {
                cell.z = '#,##0';
            }
        }
    });

    // --- finalize ---
    XLSX.utils.book_append_sheet(wb, ws, 'Stocks');

    const fileName = `stocks_report_${new Date()
        .toLocaleDateString()
        .replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
