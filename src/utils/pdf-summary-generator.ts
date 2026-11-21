import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
