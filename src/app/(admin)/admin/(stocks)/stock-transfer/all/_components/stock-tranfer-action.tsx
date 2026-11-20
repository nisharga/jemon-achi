'use client';

import { Button } from '@/admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import { Download, Edit, Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import autoTable from 'jspdf-autotable';
import React from 'react';

type IStock = {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    from?: { name?: string; _id?: string; address?: string };
    to?: { name?: string; _id?: string; address?: string };
    transferBy?: { full_name?: string; phone_number?: string; _id?: string };
    items?: Array<{
        _id: string;
        qty?: number;
        unit_cost?: number;
        product?: { name?: string };
        variant?: { sku?: string };
    }>;
    expenses_applied?: Array<{ _id: string; type?: string; amount?: number }>;
};

const StockTransferActions = ({ stock }: { stock: IStock }) => {
    const handleDownloadStockTransferPDF = () => {
        if (!stock) return;

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const leftX = 40;
        const rightX = pageWidth - 260;
        let y = 40;

        // HEADER
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Griipbuddy', pageWidth / 2, y, { align: 'center' });

        y += 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Stock Transfer Invoice', pageWidth / 2, y, {
            align: 'center'
        });

        y += 30;
        doc.setFontSize(10);

        // Stock Transfer info

        doc.text(`Status: ${stock.status ?? '-'}`, leftX, y + 14);
        // DATE (today only)
        const today = format(new Date(), 'dd/MM/yyyy');
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${today}`, leftX, y + 28);
        y += 20;

        // FROM / TO
        doc.setFont('helvetica', 'bold');
        doc.text('From:', rightX, y);
        doc.text(stock.from?.name ?? '-', rightX, y + 14);
        doc.setFont('helvetica', 'normal');
        doc.text('To:', rightX, y + 28);
        doc.text(stock.to?.name ?? '-', rightX, y + 42);

        // TRANSFER BY
        doc.setFont('helvetica', 'bold');
        doc.text('Transfer By:', leftX, y + 70);
        doc.setFont('helvetica', 'normal');
        doc.text(stock.transferBy?.full_name ?? '-', leftX, y + 84);
        if (stock.transferBy?.phone_number) {
            doc.text(`Phone: ${stock.transferBy.phone_number}`, leftX, y + 98);
        }

        y += 120;

        // ITEMS TABLE
        const tableColumns = [
            '#',
            'Product',
            'SKU',
            'Qty',
            'Shipping Cost',
            'Custom Cost'
        ];

        const shippingExpense =
            stock.expenses_applied?.find((ex) => ex.type === 'shipping')
                ?.amount ?? 0;
        const customExpense =
            stock.expenses_applied?.find((ex) => ex.type === 'custom')
                ?.amount ?? 0;

        const tableBody = (stock.items || []).map((it, i) => {
            const productName = it.product?.name ?? '-';
            const sku = it.variant?.sku ?? '-';
            const qty = it.qty ?? 0;

            // Here we divide total shipping/custom expense equally among items
            const shippingCost = shippingExpense / (stock.items?.length || 1);
            const customCost = customExpense / (stock.items?.length || 1);

            return [
                i + 1,
                productName,
                sku,
                qty,
                shippingCost.toFixed(2),
                customCost.toFixed(2)
            ];
        });

        autoTable(doc, {
            startY: y,
            head: [tableColumns],
            body: tableBody,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 128, 0] },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 210 },
                2: { cellWidth: 70 },
                3: { cellWidth: 50 },
                4: { cellWidth: 80 },
                5: { cellWidth: 80 }
            }
        });

        const finalY = doc.lastAutoTable?.finalY ?? y + 100;

        // TOTAL
        const subtotal = (stock.items || []).reduce(
            (acc, it) => acc + (it.qty ?? 0) * (it.unit_cost ?? 0),
            0
        );
        const expensesTotal = (stock.expenses_applied || []).reduce(
            (acc, ex) => acc + (ex.amount ?? 0),
            0
        );
        const totalCost = subtotal + expensesTotal;

        const totalsX = pageWidth - 240;
        let totalsY = finalY + 20;
        doc.setFont('helvetica', 'bold');
        // doc.text("Subtotal:", totalsX, totalsY);
        // doc.text(subtotal.toFixed(2), pageWidth - 60, totalsY, { align: "right" });
        totalsY += 14;
        if (expensesTotal > 0) {
            doc.text('Expenses:', totalsX, totalsY);
            doc.text(expensesTotal.toFixed(2), pageWidth - 60, totalsY, {
                align: 'right'
            });
            totalsY += 14;
        }
        doc.text('Total:', totalsX, totalsY);
        doc.text(totalCost.toFixed(2), pageWidth - 60, totalsY, {
            align: 'right'
        });

        // FOOTER
        const genAt = new Date().toLocaleString();
        doc.setFontSize(9);
        doc.text(
            `Generated At: ${genAt}`,
            40,
            doc.internal.pageSize.getHeight() - 30
        );

        const filename = `stock_transfer_${stock._id}_${format(
            new Date(),
            'yyyy-MM-dd'
        )}.pdf`;
        doc.save(filename);
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button size='icon' variant='outline'>
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                    <Link href={`/admin/stock/edit/${stock?._id}`}>
                        <Edit /> Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadStockTransferPDF}>
                    <Download /> Invoice
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StockTransferActions;
