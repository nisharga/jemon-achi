import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFullPDF = async (
    data: any,
    businessLocationData: any,
    businessLocation: string | null
) => {
    const allStocks = data?.data || [];
    const stocksReportInside = data?.summation || {};

    if (!allStocks.length) return;

    // === Landscape A4 to avoid cut off ===
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // === Header (centered using pageWidth) ===
    doc.setFontSize(16);
    doc.text('Griipbuddy', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Stock Reports', pageWidth / 2, 25, { align: 'center' });

    const selectedLocation =
        businessLocationData?.data?.businessLocations?.find(
            (loc: any) => loc._id === businessLocation
        );

    let y = 40;
    if (selectedLocation) {
        doc.setFontSize(11);
        doc.text(`Business Location: ${selectedLocation.name}`, 14, y);
        y += 8;
    }

    const today = new Date().toLocaleString();
    doc.text(`Date: ${today}`, 14, y);
    y += 8;

    // === TOP SUMMARY (inline, like screenshot) ===
    if (stocksReportInside) {
        const totalLine = `Total SKU: ${stocksReportInside?.total_products || 0}, ${(
            stocksReportInside?.summary_by_category ?? []
        )
            .map((c: any) => `${c.name} (${c.total_available_quantity} qty)`)
            .join(', ')}`;
        doc.setFont('helvetica', 'normal');
        doc.text(totalLine, 14, y);
        y += 6;
    }

    // === Table ===
    // Build rows to exactly match the UI table + calculations
    const tableBody = allStocks.map((inventory: any) => {
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
            `${avgPurchase ? avgPurchase.toFixed(0) : 0} Tk`,
            `${salePrice || 0} Tk`,
            `${availableQty} Pair/pcs`,
            `${Number(currentStockPurchaseValue).toLocaleString()} Tk`,
            `${Number(potentialSaleValue).toLocaleString()} Tk`,
            `${Number(potentialProfit).toLocaleString()} Tk`,
            `${totalSold} Pair/pcs`
        ];
    });

    // Header exactly mirroring the UI table order
    autoTable(doc, {
        startY: y + 5,
        head: [
            [
                'Product Name',
                'SKU',
                'Avg Purchase Price',
                'Sale Price',
                'Available Qty',
                // "Current Stock Purchase Value",
                'Potential Sale Value',
                'Potential Profit',
                'Total Sold'
            ]
        ],
        body: tableBody,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 14, right: 14 },
        tableWidth: 'wrap',
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 28 },
            2: { cellWidth: 24 },
            3: { cellWidth: 24 },
            4: { cellWidth: 28 },
            // 5: { cellWidth: 28 },
            6: { cellWidth: 28 },
            7: { cellWidth: 28 },
            8: { cellWidth: 15 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 8) {
                if (
                    String(data.cell.raw).trim().toLowerCase() === 'stock out'
                ) {
                    data.cell.styles.textColor = [200, 0, 0];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        pageBreak: 'auto'
    });

    // === Get where the table ends ===
    let currentY = (doc as any).lastAutoTable.finalY + 10;

    // === Summary block BELOW table ===
    if (stocksReportInside) {
        doc.setFont('helvetica', 'bold');
        doc.text('Summary:', 14, currentY);

        doc.setFont('helvetica', 'normal');
        const lineHeight = 7;
        doc.text(
            `Current Stock Value (by purchase rate): ${Number(
                Math.floor(
                    stocksReportInside?.total_current_stock_purchase_value
                ) || 0
            ).toLocaleString()} TK`,
            14,
            (currentY += lineHeight)
        );
        doc.text(
            `Potential Sale Value (by sale price): ${Number(
                Math.floor(stocksReportInside?.total_sale_value) || 0
            ).toLocaleString()} Tk`,
            14,
            (currentY += lineHeight)
        );
        doc.text(
            `Potential Profit Value (by sale price): ${Number(
                Math.floor(stocksReportInside?.total_sale_value) -
                    Math.floor(
                        stocksReportInside?.total_current_stock_purchase_value
                    ) || 0
            ).toLocaleString()} Tk`,
            14,
            (currentY += lineHeight)
        );
        doc.text(
            `Total Sold Value (sell): ${Number(
                Math.floor(stocksReportInside?.total_sold_value) || 0
            ).toLocaleString()} Tk`,
            14,
            (currentY += lineHeight)
        );
    }

    // === Signature Section ===
    if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 30;
    } else {
        currentY += 20;
    }

    // place signature lines based on page width
    const leftStart = 30;
    const leftEnd = 120;
    const rightEnd = pageWidth - 30;
    const rightStart = rightEnd - 90;

    doc.setFont('helvetica', 'normal');
    doc.line(leftStart, currentY, leftEnd, currentY);
    doc.line(rightStart, currentY, rightEnd, currentY);
    doc.text('Received by', leftStart + 25, currentY + 6);
    doc.text('Authorized by', rightStart + 25, currentY + 6);

    doc.save(`stocks_report_${new Date().toLocaleDateString()}.pdf`);
};

export const generateSummaryPDF = async (
    ubcategoryData: any,
    businessLocationData: any,
    businessLocation: string | null
) => {
    const stocksSummarySubCategory =
        ubcategoryData?.data?.summation?.summary_by_subcategory || [];
    const stocksReportInside = ubcategoryData?.data?.summation || {};

    console.log('Subcategory data for summary PDF:', stocksSummarySubCategory);
    console.log('Full summation data:', stocksReportInside);

    if (stocksSummarySubCategory.length === 0) {
        console.warn('No subcategory data available for download');
        alert('No subcategory data available to download');
        return;
    }

    // === Portrait A4 ===
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // === Header (centered using pageWidth) ===
    doc.setFontSize(16);
    doc.text('Griipbuddy', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Stock Summary Reports - By Subcategory', pageWidth / 2, 25, {
        align: 'center'
    });

    const selectedLocation =
        businessLocationData?.data?.businessLocations?.find(
            (loc: any) => loc._id === businessLocation
        );

    let y = 40;
    if (selectedLocation) {
        doc.setFontSize(11);
        doc.text(`Business Location: ${selectedLocation.name}`, 14, y);
        y += 8;
    }

    const today = new Date().toLocaleString();
    doc.text(`Date: ${today}`, 14, y);
    y += 8;

    // === TOP SUMMARY (inline, like screenshot) ===
    if (stocksReportInside) {
        const totalLine = `Total Qty: ${(
            stocksReportInside?.summary_by_category ?? []
        )
            .map((c: any) => `${c.name} (${c.total_available_quantity} Qty)`)
            .join(', ')}`;
        doc.setFont('helvetica', 'normal');

        // Wrap long text to fit page width
        const splitText = doc.splitTextToSize(totalLine, pageWidth - 28);
        doc.text(splitText, 14, y);
        y += 6 * splitText.length;
    }

    // === Table ===
    // Build rows for subcategory summary
    const tableBody = stocksSummarySubCategory.map((inventory: any) => {
        const nameWithVariant = `${inventory?.name ?? ''}`;
        const availableQty = Number(inventory?.total_available_quantity) || 0;
        const totalPurchaseValue =
            Number(inventory?.total_current_stock_purchase_value) || 0;

        return [
            nameWithVariant,
            `${availableQty} Pair/pcs`,
            `${Number(totalPurchaseValue).toLocaleString()} Tk`
        ];
    });

    // Header for subcategory summary - FIXED COLUMN WIDTHS
    autoTable(doc, {
        startY: y + 5,
        head: [['Sub Category', 'Available Quantity', 'Purchase Value']],
        body: tableBody,
        styles: {
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        tableWidth: pageWidth - 28, // Full page width minus margins
        columnStyles: {
            0: { cellWidth: (pageWidth - 28) * 0.6 }, // 60% for Sub Category
            1: { cellWidth: (pageWidth - 28) * 0.2 }, // 20% for Available Quantity
            2: { cellWidth: (pageWidth - 28) * 0.2 } // 20% for Purchase Value
        },
        pageBreak: 'auto',
        didDrawPage: function (data: any) {
            // Add page number
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
    });

    // === Get where the table ends ===
    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need new page for summary
    if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
    }

    // === Summary block BELOW table ===
    if (stocksReportInside) {
        doc.setFont('helvetica', 'bold');
        doc.text('Summary:', 14, currentY);

        doc.setFont('helvetica', 'normal');
        const lineHeight = 6;

        const summaryLines = [
            `Current Stock Value (by purchase rate): ${Number(
                Math.floor(
                    stocksReportInside?.total_current_stock_purchase_value
                ) || 0
            ).toLocaleString()} TK`,
            `Potential Sale Value (by sale price): ${Number(
                Math.floor(stocksReportInside?.total_sale_value) || 0
            ).toLocaleString()} Tk`,
            `Potential Profit Value: ${Number(
                Math.floor(stocksReportInside?.total_sale_value) -
                    Math.floor(
                        stocksReportInside?.total_current_stock_purchase_value
                    ) || 0
            ).toLocaleString()} Tk`,
            `Total Sold Value: ${Number(
                Math.floor(stocksReportInside?.total_sold_value) || 0
            ).toLocaleString()} Tk`
        ];

        summaryLines.forEach((line, index) => {
            doc.text(line, 14, currentY + (index + 1) * lineHeight);
        });

        currentY += summaryLines.length * lineHeight + 10;
    }

    // === Signature Section ===
    if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 30;
    } else {
        currentY += 10;
    }

    const signatureY = currentY;
    const leftStart = 30;
    const leftEnd = 80;
    const rightStart = pageWidth - 80;
    const rightEnd = pageWidth - 30;

    doc.setFont('helvetica', 'normal');
    doc.line(leftStart, signatureY, leftEnd, signatureY);
    doc.line(rightStart, signatureY, rightEnd, signatureY);

    doc.setFontSize(9);
    doc.text('Received by', leftStart + 10, signatureY + 5);
    doc.text('Authorized by', rightStart + 10, signatureY + 5);

    doc.save(`stocks_summary_report_${new Date().toLocaleDateString()}.pdf`);
};
