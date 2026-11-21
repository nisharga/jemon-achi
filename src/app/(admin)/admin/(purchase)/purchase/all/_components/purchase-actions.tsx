'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { IPurchase } from '@/types/purchase';
import jsPDF from 'jspdf';
import { Download, Edit, Ellipsis } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { format } from 'date-fns';
import autoTable from 'jspdf-autotable';

const PurchaseActions = ({ purchase }: { purchase: IPurchase }) => {
    // === download pdf ===
    const handleDownloadPurchasePDF = () => {
        if (!purchase) return;

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Griipbuddy', pageWidth / 2, 40, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Purchase Invoice', pageWidth / 2, 60, { align: 'center' });

        // Purchase meta (left and right blocks)
        const leftX = 40;
        const rightX = pageWidth - 260;
        let y = 90;
        doc.setFontSize(10);
        doc.text(`Purchase No: ${purchase.purchase_number ?? '-'}`, leftX, y);
        doc.text(
            `Purchase Date: ${
                purchase.purchase_date
                    ? format(new Date(purchase.purchase_date), 'dd/MM/yyyy')
                    : '-'
            }`,
            leftX,
            y + 14
        );
        doc.text(`Status: ${purchase.status ?? '-'}`, leftX, y + 28);

        // Supplier block
        const supplier = purchase.supplier;
        doc.text('Supplier:', rightX, y);
        doc.setFont('helvetica', 'bold');
        doc.text(supplier?.name ?? '-', rightX, y + 14);
        doc.setFont('helvetica', 'normal');
        if (supplier?.address)
            doc.text(`Address: ${supplier.address}`, rightX, y + 28);
        if (supplier?.phone)
            doc.text(`Phone: ${supplier.phone}`, rightX, y + 42);

        y += 80;

        // Business location block (below left)
        if (purchase.business_location) {
            doc.setFont('helvetica', 'bold');
            doc.text('Business Location:', leftX, y);
            doc.setFont('helvetica', 'normal');
            const loc = purchase.business_location;
            doc.text(`${loc.name ?? '-'}`, leftX, y + 14);
            const localAddr =
                typeof loc.address === 'string'
                    ? loc.address
                    : loc.address?.local_address ||
                      `${loc.address?.district || ''}` ||
                      '-';
            doc.text(`Address: ${localAddr}`, leftX, y + 28);
            y += 44;
        }

        // Items table using autoTable
        const tableColumns = [
            { header: '#', dataKey: 'idx' },
            { header: 'Product', dataKey: 'product' },
            { header: 'SKU', dataKey: 'sku' },
            { header: 'Qty', dataKey: 'qty' },
            { header: 'Sale Price', dataKey: 'sale_price' },
            { header: 'Line Total', dataKey: 'line_total' }
        ];

        const tableBody = (purchase?.items || [])?.map((it: any, i: number) => {
            const productName = it?.product?.name ?? '-';
            const sku = it?.variant?.sku ?? '-';
            const qty = it?.qty ?? 0;
            const salePrice = Number(it?.variant?.sale_price ?? 0);
            const lineTotal = salePrice * qty;
            return {
                idx: i + 1,
                product: productName,
                sku,
                qty,
                sale_price: salePrice.toFixed(2),
                line_total: lineTotal.toFixed(2)
            };
        });

        autoTable(doc, {
            startY: y,
            head: [tableColumns.map((c) => c.header)],
            body: tableBody.map((row) => [
                row.idx,
                row.product,
                row.sku,
                row.qty,
                row.sale_price,
                row.line_total
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 128, 0] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 210 },
                2: { cellWidth: 70 },
                3: { cellWidth: 50 },
                4: { cellWidth: 80 },
                5: { cellWidth: 80 }
            }
        });

        const finalY =
            doc.lastAutoTable?.finalY ??
            doc.internal.pageSize.getHeight() - 100;

        // Totals summary
        const subtotal = (purchase.items || []).reduce(
            (acc: number, it: any) => {
                return acc + Number(it.unit_cost ?? 0) * Number(it.qty ?? 0);
            },
            0
        );

        const expensesTotal = (purchase.expenses_applied || []).reduce(
            (acc: number, ex: any) => {
                return acc + Number(ex.amount ?? 0);
            },
            0
        );

        const totalCost =
            typeof purchase.total_cost === 'number'
                ? purchase.total_cost
                : subtotal + expensesTotal;

        const totalsX = pageWidth - 240;
        let totalsY = finalY + 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Subtotal:', totalsX, totalsY);
        doc.text(subtotal.toFixed(2).toString(), pageWidth - 60, totalsY, {
            align: 'right'
        });
        totalsY += 14;
        if (expensesTotal > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Expenses:', totalsX, totalsY);
            doc.text(
                expensesTotal.toFixed(2).toString(),
                pageWidth - 60,
                totalsY,
                {
                    align: 'right'
                }
            );
            totalsY += 14;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', totalsX, totalsY);
        doc.text(totalCost.toFixed(2).toString(), pageWidth - 60, totalsY, {
            align: 'right'
        });

        // Additional notes
        if (purchase.additional_notes) {
            const notesY = totalsY + 26;
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', leftX, notesY);
            doc.setFont('helvetica', 'normal');
            const splitNotes = doc.splitTextToSize(
                purchase.additional_notes,
                pageWidth - 80
            );
            doc.text(splitNotes, leftX, notesY + 14);
        }

        // Footer: generated at
        const genAt = new Date().toLocaleString();
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Generated At: ${genAt}`,
            40,
            doc.internal.pageSize.getHeight() - 30
        );

        const filename = `purchase_${
            purchase.purchase_number ?? purchase._id
        }_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

        doc.save(filename);
    };

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/purchase/edit/${purchase?._id}`}>
                            <Edit /> Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPurchasePDF}>
                        <Download /> Invoice
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default PurchaseActions;
