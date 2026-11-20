// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import Pagination from "@/admin/components/shared/pagination";
// import React, { Suspense, useEffect, useState } from "react";
// import { SalesTable } from "./_components/sales-table";
// import {
//   SelectItem,
//   Select,
//   SelectContent,
//   SelectTrigger,
//   SelectValue,
// } from "@/admin/components/ui/select";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/admin/components/ui/accordion";
// import { File, FileSpreadsheet, Filter, Loader } from "lucide-react";
// import { useGetAllBusinessLocationsQuery } from "@/admin/redux/api-queries/business-location-api";
// import { IBusiness_location } from "@/admin/types/business-location";
// import {
//   useGetAllPosSalesQuery,
//   useGetPosSalesReportQuery,
//   useLazyGetAllPosSalesQuery,
// } from "@/admin/redux/api-queries/pos-sale-api";
// import { DateRangeCalendar } from "@/admin/components/ui/date-range-calendar";
// import type { DateRange } from "react-day-picker";
// import { Label } from "@/admin/components/ui/label";
// import { Input } from "@/admin/components/ui/input";
// import { endOfDay, format, startOfDay } from "date-fns";
// import SaleReport from "./_components/sale-report";
// import { Button } from "@/admin/components/ui/button";
// import autoTable from "jspdf-autotable";
// import jsPDF from "jspdf";
// import {
//   parseAsIsoDate,
//   parseAsString,
//   useQueryState,
//   useQueryStates,
// } from "nuqs";
// import useDebounce from "@/admin/hooks/use-debounce";
// import { useLoggedInUser } from "@/admin/hooks/use-loggedin-user";
// import * as XLSX from "xlsx";
// import { useGetAllStaffsQuery } from "@/admin/redux/api-queries/staff-api";
// import { IRoles, TUser, USER_ROLE } from "@/admin/types/user";
// import { Badge } from "@/admin/components/ui/badge";
// import { getRoleBadgeVariant } from "@/admin/utils/getRoleBadgeVariant";
// import { useHasPermission } from "@/admin/hooks/use-has-permission";
// import { PermissionEnum } from "@/admin/types/permistion";

// const AllPosSalesComponent = () => {
//   // === check permissions ===
//   const { hasPermission, isPermissionLoading } = useHasPermission({
//     permissions: [
//       // PermissionEnum.POS_VIEW,
//       PermissionEnum.PURCHEASE_VALUE,
//       PermissionEnum.POTENTIAL_PROFIT,
//     ],
//   });

//   // === api query states ===
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState<string | number>(20);

//   // === nuqs state api quries ===
//   const [businessLocation, setBusinessLocation] =
//     useQueryState("businessLocation");
//   const [createdBy, setCreatedBy] = useQueryState("createdBy");
//   const [saleSerialId, setSaleSerialId] = useQueryState(
//     "saleSerialId",
//     parseAsString.withDefault("")
//   );
//   const debouncedSaleSerialId = useDebounce(saleSerialId);
//   const [{ from, to, selectedOption }, setDateRangeAndOption] = useQueryStates(
//     {
//       from: parseAsIsoDate.withDefault(startOfDay(new Date())),
//       to: parseAsIsoDate.withDefault(endOfDay(new Date())),
//       selectedOption: parseAsString.withDefault("Today"),
//     },
//     { history: "replace" }
//   );
//   const dateRange: DateRange | undefined = { from, to };

//   // === handle clear filter ===
//   const handleClearFilter = () => {
//     setDateRangeAndOption(null);
//     setBusinessLocation(null);
//     setSaleSerialId("");
//     setCreatedBy(null);
//   };
//   const { profile } = useLoggedInUser();
//   // === get all purchases ===
//   const { data, isLoading, isFetching } = useGetAllPosSalesQuery({
//     page,
//     limit,
//     business_location_id: businessLocation,
//     sale_serial_id: debouncedSaleSerialId,
//     created_by: createdBy,
//     startDate: from?.toLocaleDateString("en-CA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }),
//     endDate: to?.toLocaleDateString("en-CA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }),
//   });
//   const posSales = data?.data?.posSales;
//   const posSalesMeta = data?.data?.meta;

//   // === get all business locations ===
//   const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
//   const businessLocationOptions =
//     businessLocationData?.data?.businessLocations?.map(
//       (businessLocation: IBusiness_location) => ({
//         label: businessLocation?.name,
//         value: businessLocation?._id,
//       })
//     ) || [];

//   // === get all staffs ===
//   const { data: staffData } = useGetAllStaffsQuery({
//     page: 1,
//     limit: 100,
//     role: Object.values(USER_ROLE),
//   });
//   const staffs = staffData?.data?.data;
//   const formatedStaffs = staffs?.map((staff: Partial<TUser>) => ({
//     full_name: staff?.full_name,
//     _id: staff?._id,
//     role: staff?.role,
//   }));

//   // === get pos sale reports ===
//   const {
//     data: posReportData,
//     isLoading: posReportLoading,
//     isFetching: posReportFetching,
//   } = useGetPosSalesReportQuery({
//     business_location_id: businessLocation,
//     created_by: createdBy,
//     startDate: from?.toLocaleDateString("en-CA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }),
//     endDate: to?.toLocaleDateString("en-CA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }),
//   });
//   const posSalesReport = posReportData?.data;

//   // === lazy query for full sales data ===
//   const [fetchAllSales, { isFetching: isDownloading }] =
//     useLazyGetAllPosSalesQuery();

//   // =================== PDF ===================
//   const handleDownloadSalesPDF = async () => {
//     try {
//       const { data } = await fetchAllSales({
//         business_location_id: businessLocation,
//         sale_serial_id: debouncedSaleSerialId,
//         page: 1,
//         limit: posSalesMeta?.total || 100000,
//         startDate: dateRange?.from?.toLocaleDateString("en-CA", {
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//         }),
//         endDate: dateRange?.to?.toLocaleDateString("en-CA", {
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//         }),
//       }).unwrap();

//       const allSales = data?.posSales || [];
//       if (!allSales.length) return;

//       const fmtTk = (n: any) =>
//         `${Math.round(Number(n || 0)).toLocaleString()} Tk`;

//       // ---- robust fallbacks for totals ----
//       const computedTotalProfit = allSales.reduce(
//         (s: number, x: any) => s + Number(x?.profit || 0),
//         0
//       );
//       const computedTotalPurchase = allSales.reduce(
//         (s: number, sale: any) =>
//           s +
//           (sale?.products || []).reduce(
//             (pSum: number, p: any) => pSum + Number(p?.total_cost || 0),
//             0
//           ),
//         0
//       );

//       const report = {
//         totalSales:
//           posSalesReport?.totalSales ||
//           allSales.reduce(
//             (s: number, x: any) =>
//               s + Number(x?.sub_total || x?.total_amount || 0),
//             0
//           ),
//         totalProfit: Number(posSalesReport?.totalProfit ?? computedTotalProfit),
//         totalPurchase: Number(
//           posSalesReport?.totalCost ?? computedTotalPurchase
//         ),
//         totalQuantity:
//           data?.report?.totalQuantity ??
//           data?.totalQuantity ??
//           allSales.reduce(
//             (sum: number, sale: any) =>
//               sum +
//               (sale?.products || []).reduce(
//                 (pSum: number, p: any) => pSum + Number(p?.quantity || 0),
//                 0
//               ),
//             0
//           ),
//         openingStock: posSalesReport?.openingStock || {
//           current_stock_value_by_purchase_rate: 0,
//           potential_sale_value_by_sale_price: 0,
//           potential_profit_value_by_sale_price: 0,
//           categories: [],
//         },
//         closingStock: posSalesReport?.closingStock || {
//           current_stock_value_by_purchase_rate: 0,
//           potential_sale_value_by_sale_price: 0,
//           potential_profit_value_by_sale_price: 0,
//           categories: [],
//         },
//       };

//       // === PDF (LANDSCAPE) ===
//       const doc = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: "a4",
//       });
//       const pageW = doc.internal.pageSize.getWidth();
//       const pageH = doc.internal.pageSize.getHeight();
//       const centerX = pageW / 2;
//       const margin = { left: 12, right: 12, top: 16, bottom: 12 };

//       const selectedLocation =
//         businessLocationData?.data?.businessLocations?.find(
//           (loc: any) => loc._id === businessLocation
//         );
//       const locationName = selectedLocation?.name || "All Locations";
//       const generatedByName = profile?.full_name || "Unknown";
//       const generatedAt = format(new Date(), "dd/MM/yyyy hh:mm a");
//       const rangeLine =
//         dateRange?.from && dateRange?.to
//           ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
//               dateRange.to,
//               "dd/MM/yyyy"
//             )}`
//           : "";

//       // Header (first page only)
//       doc.setFontSize(16);
//       doc.text("Griipbuddy", centerX, 15, { align: "center" });
//       doc.setFontSize(13);
//       doc.text("Sales Report", centerX, 22, { align: "center" });
//       doc.setFontSize(13);
//       doc.text(locationName, centerX, 29, { align: "center" });
//       if (rangeLine) doc.text(rangeLine, centerX, 35, { align: "center" });
//       doc.setFontSize(10);
//       doc.text(
//         `Generated by ${generatedByName} at ${generatedAt}`,
//         margin.left,
//         38
//       );

//       const skusCell = (sale: any) => {
//         const arr = (sale?.products ?? [])
//           .map((p: any) => `${p?.selected_variant?.sku} (Qty ${p?.quantity})`)
//           .filter(Boolean);
//         const seen = new Set<string>();
//         const uniq = arr.filter((s: string) =>
//           seen.has(s) ? false : seen.add(s)
//         );
//         return uniq.join(", ") || "—";
//       };

//       autoTable(doc, {
//         startY: 42,
//         margin,
//         styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
//         headStyles: { fillColor: [10, 51, 67], textColor: [255, 255, 255] },
//         theme: "grid",
//         head: [
//           [
//             "Date",
//             "Sale Id",
//             "Total Qty",
//             "Items SKU",
//             "Total Paid",
//             // "Purchase Price",
//             "Total Profit",
//             "Total Discount",
//             "Total Amount",
//             "Sell Due",
//             "Payment Status",
//             "Payment Method",
//             "Added By",
//             "Sell Note",
//             "Payment Note",
//           ],
//         ],
//         body: allSales.map((sale: any) => [
//           sale?.sale_date
//             ? `${format(new Date(sale.sale_date), "dd/MM/yyyy")}\n${format(
//                 new Date(sale.sale_date),
//                 "hh:mm a"
//               )}`
//             : "-",
//           sale?.sale_serial_id ? `#${sale?.sale_serial_id}` : "-",
//           (sale?.products ?? []).reduce(
//             (sum: number, p: any) => sum + Number(p?.quantity || 0),
//             0
//           ),
//           skusCell(sale),
//           fmtTk(sale?.paid_amount),
//           fmtTk(
//             (sale?.products ?? []).reduce(
//               (sum: number, p: any) => sum + (Number(p?.total_cost) || 0),
//               0
//             )
//           ),
//           fmtTk(sale?.profit),
//           fmtTk(sale?.total_discount),
//           fmtTk(sale?.sub_total ?? sale?.total_amount),
//           fmtTk(sale?.due_amount),
//           sale?.payment_status || "-",
//           sale?.payment_method || "-",
//           sale?.created_by?.[0]?.full_name ||
//             sale?.created_by?.full_name ||
//             "-",
//           sale?.sale_note || "-",
//           sale?.payment_note || "-",
//         ]),
//         columnStyles: {
//           0: { cellWidth: 20 },
//           1: { cellWidth: 14 },
//           2: { cellWidth: 12, halign: "center" },
//           3: { cellWidth: 26 },
//           // 4: { cellWidth: 20 },
//           5: { cellWidth: 20 },
//           6: { cellWidth: 20 },
//           7: { cellWidth: 18 },
//           8: { cellWidth: 20 },
//           9: { cellWidth: 14 },
//           10: { cellWidth: 18 },
//           11: { cellWidth: 18 },
//           12: { cellWidth: 18 },
//           13: { cellWidth: 18 },
//           14: { cellWidth: 18 },
//         },
//       });

//       // === SUMMARY area ===
//       let y = (doc as any).lastAutoTable.finalY + 12;
//       const usableBottom = pageH - margin.bottom;
//       const neededHeight = 62;
//       if (y + neededHeight > usableBottom) {
//         doc.addPage();
//         y = margin.top;
//       }

//       // Category-wise text (unchanged)
//       const cats =
//         (posSalesReport as any)?.soldByCategory ??
//         report?.closingStock?.categories ??
//         [];
//       const catParts = Array.isArray(cats)
//         ? cats
//             .map((c: any) => {
//               const name = c?.category_name || c?.name || "";
//               const sold = Math.round(Number(c?.total_sold ?? c?.sold ?? 0));
//               return name && sold > 0 ? `${name} ${sold}` : null;
//             })
//             .filter(Boolean)
//         : [];
//       const soldLine =
//         catParts.length > 0
//           ? `Total Items Sold: ${catParts.join(" , ")}`
//           : `Total Items Sold: ${report.totalQuantity || 0}`;

//       doc.setFontSize(11);
//       doc.text(soldLine, margin.left, y);

//       const totalSell = fmtTk(report.totalSales || 0);
//       const totalPurchase = fmtTk(report.totalPurchase || 0);
//       const totalProfit = fmtTk(report.totalProfit || 0);

//       // center: Total Sell
//       doc.text(`Total Sell Value: ${totalSell}`, centerX, y, {
//         align: "center",
//       });
//       // right: Purchase + Profit
//       doc.text(
//         `Total Purchase Value: ${totalPurchase}    Total Profit: ${totalProfit}`,
//         pageW - margin.right,
//         y,
//         { align: "right" }
//       );

//       const y2 = y + 6;
//       doc.line(margin.left, y2, pageW - margin.right, y2);

//       // === Opening / Closing Stock (unchanged) ===
//       const renderStockBlock = (
//         title: string,
//         x: number,
//         yTop: number,
//         stock: any
//       ) => {
//         const lh = 6;
//         doc.setFontSize(12);
//         doc.text(title, x, yTop);
//         doc.setFontSize(10);
//         let yy = yTop + lh;

//         const categories: any[] = Array.isArray(stock?.categories)
//           ? stock.categories
//           : [];
//         if (categories.length) {
//           categories.forEach((c) => {
//             doc.text(
//               `${c?.category_name || "-"}: ${Math.round(
//                 c?.total_available_quantity || 0
//               )} Pair/pcs`,
//               x,
//               yy
//             );
//             yy += lh;
//           });
//         } else {
//           doc.text("—", x, yy);
//           yy += lh;
//         }

//         yy += 2;
//         const purchaseVal = fmtTk(
//           stock?.current_stock_value_by_purchase_rate || 0
//         );
//         const potentialSaleVal = fmtTk(
//           stock?.potential_sale_value_by_sale_price || 0
//         );

//         doc.text(`Total Stock Value by Purchase: ${purchaseVal}`, x, yy);
//         yy += lh;
//         doc.text(`Total Stock Value by Sell: ${potentialSaleVal}`, x, yy);
//         yy += lh;

//         return yy;
//       };

//       const blockTop = y2 + 8;
//       const leftX = margin.left;
//       const rightX = centerX + 10;
//       const endLeft = renderStockBlock(
//         "Opening Stock",
//         leftX,
//         blockTop,
//         report.openingStock
//       );
//       const endRight = renderStockBlock(
//         "Closing Stock",
//         rightX,
//         blockTop,
//         report.closingStock
//       );
//       doc.line(centerX, blockTop - 4, centerX, Math.max(endLeft, endRight));

//       doc.save(
//         `sales_report_${locationName}_${new Date().toLocaleDateString()}.pdf`
//       );
//     } catch (err) {
//       console.error("Download error:", err);
//     }
//   };

//   // =================== EXCEL ===================

//   const handleDownloadExcelReport = async () => {
//     try {
//       const { data } = await fetchAllSales({
//         business_location_id: businessLocation,
//         sale_serial_id: debouncedSaleSerialId,
//         page: 1,
//         limit: posSalesMeta?.total || 100000,
//         startDate: dateRange?.from?.toLocaleDateString("en-CA", {
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//         }),
//         endDate: dateRange?.to?.toLocaleDateString("en-CA", {
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//         }),
//       }).unwrap();

//       const allSales = data?.posSales || [];
//       if (!allSales.length) return;

//       const fmtTkNum = (n: any) => Math.round(Number(n || 0));
//       const joinSkus = (sale: any) => {
//         const arr = (sale?.products ?? [])
//           .map((p: any) => `${p?.selected_variant?.sku} (Qty ${p?.quantity})`)
//           .filter(Boolean);
//         const seen = new Set<string>();
//         const uniq = arr.filter((s: string) =>
//           seen.has(s) ? false : seen.add(s)
//         );
//         return uniq.join(", ") || "—";
//       };

//       // Robust totals (same logic as PDF)
//       const computedTotalProfit = allSales.reduce(
//         (s: number, x: any) => s + Number(x?.profit || 0),
//         0
//       );
//       const computedTotalPurchase = allSales.reduce(
//         (s: number, sale: any) =>
//           s +
//           (sale?.products || []).reduce(
//             (pSum: number, p: any) => pSum + Number(p?.total_cost || 0),
//             0
//           ),
//         0
//       );

//       const report = {
//         totalSales:
//           posSalesReport?.totalSales ||
//           allSales.reduce(
//             (s: number, x: any) =>
//               s + Number(x?.sub_total || x?.total_amount || 0),
//             0
//           ),
//         totalProfit: Number(posSalesReport?.totalProfit ?? computedTotalProfit),
//         totalPurchase: Number(
//           posSalesReport?.totalCost ?? computedTotalPurchase
//         ),
//         totalQuantity:
//           data?.report?.totalQuantity ??
//           data?.totalQuantity ??
//           allSales.reduce(
//             (sum: number, sale: any) =>
//               sum +
//               (sale?.products || []).reduce(
//                 (pSum: number, p: any) => pSum + Number(p?.quantity || 0),
//                 0
//               ),
//             0
//           ),
//         openingStock: posSalesReport?.openingStock || {
//           current_stock_value_by_purchase_rate: 0,
//           potential_sale_value_by_sale_price: 0,
//           potential_profit_value_by_sale_price: 0,
//           categories: [],
//         },
//         closingStock: posSalesReport?.closingStock || {
//           current_stock_value_by_purchase_rate: 0,
//           potential_sale_value_by_sale_price: 0,
//           potential_profit_value_by_sale_price: 0,
//           categories: [],
//         },
//       };

//       const selectedLocation =
//         businessLocationData?.data?.businessLocations?.find(
//           (loc: any) => loc._id === businessLocation
//         );
//       const locationName = selectedLocation?.name || "All Locations";
//       const generatedByName = profile?.full_name || "Unknown";
//       const generatedAt = format(new Date(), "dd/MM/yyyy hh:mm a");
//       const rangeLine =
//         dateRange?.from && dateRange?.to
//           ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
//               dateRange.to,
//               "dd/MM/yyyy"
//             )}`
//           : "";

//       const HEADER_FILL = "0A3342";
//       const WHITE = "FFFFFF";

//       const aoa: any[][] = [];
//       aoa.push(["Griipbuddy"]);
//       aoa.push(["Sales Report"]);
//       aoa.push([locationName]);
//       aoa.push([rangeLine || ""]);
//       aoa.push([`Generated by ${generatedByName} at ${generatedAt}`]);
//       aoa.push([]);

//       const tableHeader = [
//         "Date",
//         "Sale Id",
//         "Total Qty",
//         "Items SKU",
//         "Total Paid",
//         // "Purchase Price", // REMOVED
//         "Total Profit",
//         "Total Discount",
//         "Total Amount",
//         "Sell Due",
//         "Payment Status",
//         "Payment Method",
//         "Added By",
//         "Sell Note",
//         "Payment Note",
//       ];
//       aoa.push(tableHeader);

//       for (const sale of allSales) {
//         // REMOVED purchasePrice calculation since we don't need it
//         aoa.push([
//           sale?.sale_date
//             ? `${format(new Date(sale.sale_date), "dd/MM/yyyy")} ${format(
//                 new Date(sale.sale_date),
//                 "hh:mm a"
//               )}`
//             : "-",
//           sale?.sale_serial_id ? `#${sale?.sale_serial_id}` : "-",
//           (sale?.products ?? []).reduce(
//             (sum: number, p: any) => sum + Number(p?.quantity || 0),
//             0
//           ),
//           joinSkus(sale),
//           fmtTkNum(sale?.paid_amount),
//           // fmtTkNum(purchasePrice), // REMOVED
//           fmtTkNum(sale?.profit),
//           fmtTkNum(sale?.total_discount),
//           fmtTkNum(sale?.sub_total ?? sale?.total_amount),
//           fmtTkNum(sale?.due_amount),
//           sale?.payment_status || "-",
//           sale?.payment_method || "-",
//           sale?.created_by?.[0]?.full_name ||
//             sale?.created_by?.full_name ||
//             "-",
//           sale?.sale_note || "-",
//           sale?.payment_note || "-",
//         ]);
//       }

//       // Summary line (now includes Sell, Purchase, Profit)
//       aoa.push([]);
//       const cats =
//         (posSalesReport as any)?.soldByCategory ??
//         report?.closingStock?.categories ??
//         [];
//       const catParts = Array.isArray(cats)
//         ? cats
//             .map((c: any) => {
//               const name = c?.category_name || c?.name || "";
//               const sold = Math.round(Number(c?.total_sold ?? c?.sold ?? 0));
//               return name && sold > 0 ? `${name} ${sold}` : null;
//             })
//             .filter(Boolean)
//         : [];
//       const soldLine =
//         catParts.length > 0
//           ? `Total Items Sold: ${catParts.join(" , ")}`
//           : `Total Items Sold: ${report.totalQuantity || 0}`;

//       aoa.push([
//         soldLine,
//         "",
//         "",
//         "",
//         "",
//         // "", // REMOVED one empty cell since we removed Purchase Price column
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         `Total Sell Value: ${fmtTkNum(report.totalSales).toLocaleString()} Tk`,
//         `Total Purchase Value: ${fmtTkNum(
//           report.totalPurchase
//         ).toLocaleString()} Tk`,
//         `Total Profit: ${fmtTkNum(report.totalProfit).toLocaleString()} Tk`,
//       ]);

//       aoa.push([]);
//       aoa.push(["Opening Stock", "", "", "", "", "", "", "", "Closing Stock"]);

//       const maxCatRows = Math.max(
//         Array.isArray(report.openingStock?.categories)
//           ? report.openingStock.categories.length
//           : 0,
//         Array.isArray(report.closingStock?.categories)
//           ? report.closingStock.categories.length
//           : 0
//       );

//       for (let i = 0; i < Math.max(1, maxCatRows); i++) {
//         const o = report.openingStock?.categories?.[i];
//         const c = report.closingStock?.categories?.[i];
//         aoa.push([
//           o
//             ? `${o?.category_name || "-"}: ${Math.round(
//                 o?.total_available_quantity || 0
//               )} Pair/pcs`
//             : i === 0
//             ? "—"
//             : "",
//           "",
//           "",
//           "",
//           "",
//           // "", // REMOVED one empty cell
//           "",
//           "",
//           "",
//           c
//             ? `${c?.category_name || "-"}: ${Math.round(
//                 c?.total_available_quantity || 0
//               )} Pair/pcs`
//             : i === 0
//             ? "—"
//             : "",
//         ]);
//       }

//       aoa.push([
//         `Total Stock Value by Purchase: ${fmtTkNum(
//           report.openingStock?.current_stock_value_by_purchase_rate || 0
//         ).toLocaleString()} Tk`,
//         "",
//         "",
//         "",
//         "",
//         // "", // REMOVED one empty cell
//         "",
//         "",
//         "",
//         `Total Stock Value by Purchase: ${fmtTkNum(
//           report.closingStock?.current_stock_value_by_purchase_rate || 0
//         ).toLocaleString()} Tk`,
//       ]);
//       aoa.push([
//         `Total Stock Value by Sell: ${fmtTkNum(
//           report.openingStock?.potential_sale_value_by_sale_price || 0
//         ).toLocaleString()} Tk`,
//         "",
//         "",
//         "",
//         "",
//         // "", // REMOVED one empty cell
//         "",
//         "",
//         "",
//         `Total Stock Value by Sell: ${fmtTkNum(
//           report.closingStock?.potential_sale_value_by_sale_price || 0
//         ).toLocaleString()} Tk`,
//       ]);

//       const ws = XLSX.utils.aoa_to_sheet(aoa);

//       const lastCol = tableHeader.length - 1; // Now 13 instead of 14
//       ws["!merges"] = [
//         { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
//         { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
//         { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
//         { s: { r: 3, c: 0 }, e: { r: 3, c: lastCol } },
//         { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } },
//         // keep the left summary spanning several columns
//         {
//           s: { r: 7 + allSales.length + 1, c: 0 },
//           e: { r: 7 + allSales.length + 1, c: 7 }, // Updated to 7 since we removed one column
//         },
//       ];

//       // Update column widths - removed one width entry
//       ws["!cols"] = [
//         { wch: 38 }, // Date
//         { wch: 22 }, // Sale Id
//         { wch: 20 }, // Total Qty
//         { wch: 32 }, // Items SKU
//         { wch: 24 }, // Total Paid
//         // { wch: 24 }, // Purchase Price - REMOVED
//         { wch: 14 }, // Total Profit
//         { wch: 14 }, // Total Discount
//         { wch: 14 }, // Total Amount
//         { wch: 12 }, // Sell Due
//         { wch: 14 }, // Payment Status
//         { wch: 14 }, // Payment Method
//         { wch: 16 }, // Added By
//         { wch: 58 }, // Sell Note
//         { wch: 58 }, // Payment Note
//       ];

//       const setCell = (ref: string, props: any) => {
//         if (!ws[ref]) return;
//         ws[ref].s = { ...(ws[ref].s || {}), ...props };
//       };

//       for (let r = 0; r <= 4; r++) {
//         const ref = XLSX.utils.encode_cell({ r, c: 0 });
//         setCell(ref, {
//           alignment: { horizontal: "center", vertical: "center" },
//         });
//         if (r === 0) setCell(ref, { font: { bold: true, sz: 16 } });
//         if (r === 1) setCell(ref, { font: { bold: true, sz: 13 } });
//         if (r === 2) setCell(ref, { font: { bold: true, sz: 12 } });
//         if (r === 3) setCell(ref, { font: { sz: 11 } });
//         if (r === 4) setCell(ref, { font: { sz: 10 } });
//       }

//       for (let c = 0; c <= lastCol; c++) {
//         const ref = XLSX.utils.encode_cell({ r: 6, c });
//         setCell(ref, {
//           font: { bold: true, color: { rgb: WHITE } },
//           fill: { fgColor: { rgb: HEADER_FILL } },
//           alignment: {
//             horizontal: "center",
//             vertical: "center",
//             wrapText: true,
//           },
//           border: {
//             top: { style: "thin", color: { rgb: "CCCCCC" } },
//             left: { style: "thin", color: { rgb: "CCCCCC" } },
//             right: { style: "thin", color: { rgb: "CCCCCC" } },
//             bottom: { style: "thin", color: { rgb: "CCCCCC" } },
//           },
//         });
//       }

//       // Number formats - updated money columns (removed index 5 which was purchase price)
//       const moneyCols = [4, 5, 6, 7, 8]; // Now 4-8 instead of 4-9
//       const firstDataRow = 7;
//       const lastDataRow = firstDataRow + allSales.length - 1;
//       for (let r = firstDataRow; r <= lastDataRow; r++) {
//         moneyCols.forEach((c) => {
//           const ref = XLSX.utils.encode_cell({ r, c });
//           if (ws[ref]) {
//             ws[ref].t = "n";
//             ws[ref].z = '#,##0" Tk"';
//             setCell(ref, { alignment: { horizontal: "right" } });
//           }
//         });
//         // Updated column indices for wrapText (removed 3 from the array since Items SKU is now at index 3)
//         [0, 3, 11, 12, 13].forEach((c) => {
//           const ref = XLSX.utils.encode_cell({ r, c });
//           if (ws[ref]) setCell(ref, { alignment: { wrapText: true } });
//         });
//       }

//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
//       XLSX.writeFile(
//         wb,
//         `sales_report_${locationName}_${new Date().toLocaleDateString()}.xlsx`
//       );
//     } catch (err) {
//       console.error("Download Excel error:", err);
//     }
//   };

//   // === paginations ===
//   // === handling page change ===
//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };
//   // === reset to first page whenover limit or other parameters were changed ===
//   useEffect(() => {
//     setPage(1);
//   }, [limit]);

//   // === loading and persmission error card ===
//   // if (!isPermissionLoading && !hasPermission) {
//   //   return <PermissionErrorCard />;
//   // }
//   // if (isPermissionLoading) {
//   //   return <PermissionLoaderCard />;
//   // }

//   return (
//     <section className="flex flex-col gap-6">
//       <div className="flex items-center justify-between gap-2">
//         <h1 className="font-medium text-2xl">
//           {" "}
//           Sales Reports{" "}
//           {selectedOption !== "All Time" && (
//             <>
//               for{" "}
//               <span className="text-emerald-600">
//                 {" "}
//                 {dateRange?.from?.toDateString()}
//               </span>{" "}
//               {dateRange?.from?.toLocaleDateString("en-CA", {
//                 year: "numeric",
//                 day: "2-digit",
//                 month: "2-digit",
//               }) !==
//                 dateRange?.to?.toLocaleDateString("en-CA", {
//                   year: "numeric",
//                   day: "2-digit",
//                   month: "2-digit",
//                 }) && (
//                 <>
//                   to{" "}
//                   <span className="text-emerald-600">
//                     {dateRange?.to?.toDateString()}
//                   </span>
//                 </>
//               )}
//             </>
//           )}
//         </h1>
//       </div>
//       {/* search filter */}
//       <div className="bg-background rounded-lg shadow-md">
//         <Accordion type="single" collapsible defaultValue="item-1">
//           <AccordionItem value="item-1">
//             <AccordionTrigger
//               isHideChevron={true}
//               className="p-4 text-lg font-medium border-b hover:
//          cursor-pointer rounded-b-none hover:no-underline"
//             >
//               <span className="flex items-center gap-2 text-emerald-600">
//                 <Filter className="size-5" /> Filter
//               </span>
//             </AccordionTrigger>
//             <AccordionContent>
//               <div className="grid md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 pt-4">
//                 {/* filter by business location */}
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Business Location</p>
//                   <Select
//                     onValueChange={(value) => {
//                       setBusinessLocation(value === "all" ? null : value);
//                     }}
//                     defaultValue="all"
//                     value={businessLocation ? businessLocation : "all"}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select business location" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All</SelectItem>
//                       {businessLocationOptions?.map(
//                         (
//                           businessLocation: { label: string; value: string },
//                           index: number
//                         ) => (
//                           <SelectItem
//                             key={index}
//                             value={businessLocation?.value}
//                           >
//                             {businessLocation?.label}
//                           </SelectItem>
//                         )
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {/* search by sale serial id */}
//                 <div className="space-y-2 mt-1.5">
//                   <Label>Sale Serial Id</Label>
//                   <Input
//                     placeholder="Search by sale id"
//                     onChange={(e) => setSaleSerialId(e.target.value)}
//                     value={saleSerialId}
//                   />
//                 </div>
//                 {/* filter by created by */}
//                 <div className="space-y-2 mt-1.5">
//                   <Label>Sale Created By</Label>
//                   <Select
//                     onValueChange={(value) => {
//                       setCreatedBy(value === "all" ? null : value);
//                     }}
//                     defaultValue="all"
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select user" />
//                     </SelectTrigger>

//                     <SelectContent className="max-h-96">
//                       <SelectItem value="all">All</SelectItem>
//                       {formatedStaffs?.map(
//                         (staff: Partial<TUser>, index: number) => {
//                           return (
//                             <SelectItem
//                               key={index}
//                               value={staff?._id as string}
//                             >
//                               {staff?.full_name}
//                               <Badge
//                                 variant={getRoleBadgeVariant(
//                                   staff?.role as IRoles
//                                 )}
//                                 className="text-[10px]"
//                               >
//                                 {staff?.role && staff?.role.replace(/_/g, " ")}
//                               </Badge>
//                             </SelectItem>
//                           );
//                         }
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {/* filter by date range */}
//                 <div className="space-y-2 lg:col-span-2">
//                   <p className="text-sm font-medium">Date Range</p>
//                   <DateRangeCalendar
//                     value={dateRange}
//                     selectedOption={selectedOption}
//                     onDateChange={(newDateRange) => {
//                       if (newDateRange) {
//                         setDateRangeAndOption({
//                           from: newDateRange.from,
//                           to: newDateRange.to,
//                         });
//                       }
//                     }}
//                     onOptionChange={(newOption) => {
//                       setDateRangeAndOption({ selectedOption: newOption });
//                     }}
//                     defaultOption="Today"
//                   />
//                 </div>

//                 {/* handle clear filter */}
//                 <div className="flex items-end justify-end h-full">
//                   <Button onClick={handleClearFilter}>Clear Filter</Button>
//                 </div>
//               </div>
//             </AccordionContent>
//           </AccordionItem>
//         </Accordion>
//       </div>
//       <SaleReport
//         posSalesReport={posSalesReport}
//         isLoading={posReportLoading}
//         isFetching={posReportFetching}
//       />
//       {/* download report */}
//       <div className="w-fit ms-auto flex items-center gap-4">
//         <Button
//           variant="outline"
//           size="lg"
//           className="w-fit gap-1"
//           onClick={handleDownloadExcelReport}
//           disabled={!posSalesReport || isDownloading}
//         >
//           {isDownloading ? (
//             <>
//               <Loader className="size-4 animate-spin" />
//               Donwloading...
//             </>
//           ) : (
//             <>
//               <FileSpreadsheet className="size-4" />
//               Download Excel
//             </>
//           )}
//         </Button>
//         <Button
//           variant="green"
//           onClick={handleDownloadSalesPDF}
//           disabled={isDownloading}
//         >
//           {isDownloading ? (
//             <>
//               <Loader className="animate-spin" /> Preparing...
//             </>
//           ) : (
//             <>
//               <File className="size-4" /> Download PDF
//             </>
//           )}
//         </Button>
//       </div>
//       {/* table */}
//       <SalesTable
//         sales={posSales}
//         hasPermission={hasPermission}
//         isPermissionLoading={isPermissionLoading}
//         isLoading={isLoading}
//         isFetching={isFetching}
//       />
//       {/* pagination */}
//       {posSalesMeta?.total > 0 && (
//         <div className="bg-background p-2 rounded-lg shadow-md">
//           <Pagination
//             limit={limit}
//             setLimit={setLimit}
//             currentPage={page}
//             onPageChange={handlePageChange}
//             totalItems={posSalesMeta?.total}
//           />
//         </div>
//       )}
//     </section>
//   );
// };

// const AllPosSalesPage = () => {
//   return (
//     <Suspense fallback={<>Loading..</>}>
//       <AllPosSalesComponent />
//     </Suspense>
//   );
// };

// export default AllPosSalesPage;

'use client';

import Pagination from '@/admin/components/shared/pagination';
import React, { Suspense, useEffect, useState } from 'react';
import { SalesTable } from './_components/sales-table';
import {
    SelectItem,
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/admin/components/ui/accordion';
import { File, FileSpreadsheet, Filter, Loader } from 'lucide-react';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import { IBusiness_location } from '@/admin/types/business-location';
import {
    useGetAllPosSalesQuery,
    useGetPosSalesReportQuery,
    useLazyGetAllPosSalesQuery
} from '@/admin/redux/api-queries/pos-sale-api';
import { DateRangeCalendar } from '@/admin/components/ui/date-range-calendar';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/admin/components/ui/label';
import { Input } from '@/admin/components/ui/input';
import { endOfDay, format, startOfDay } from 'date-fns';
import SaleReport from './_components/sale-report';
import { Button } from '@/admin/components/ui/button';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import {
    parseAsIsoDate,
    parseAsString,
    useQueryState,
    useQueryStates
} from 'nuqs';
import useDebounce from '@/admin/hooks/use-debounce';
import { useLoggedInUser } from '@/admin/hooks/use-loggedin-user';
import * as XLSX from 'xlsx';
import { useGetAllStaffsQuery } from '@/admin/redux/api-queries/staff-api';
import { IRoles, TUser, USER_ROLE } from '@/admin/types/user';
import { Badge } from '@/admin/components/ui/badge';
import { getRoleBadgeVariant } from '@/admin/utils/getRoleBadgeVariant';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';

const AllPosSalesComponent = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            // PermissionEnum.POS_VIEW,
            PermissionEnum.PURCHASE_VIEW,
            PermissionEnum.POTENTIAL_PROFIT_VIEW
        ]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === nuqs state api quries ===
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');
    const [createdBy, setCreatedBy] = useQueryState('createdBy');
    const [saleSerialId, setSaleSerialId] = useQueryState(
        'saleSerialId',
        parseAsString.withDefault('')
    );
    const debouncedSaleSerialId = useDebounce(saleSerialId);
    const [{ from, to, selectedOption }, setDateRangeAndOption] =
        useQueryStates(
            {
                from: parseAsIsoDate.withDefault(startOfDay(new Date())),
                to: parseAsIsoDate.withDefault(endOfDay(new Date())),
                selectedOption: parseAsString.withDefault('Today')
            },
            { history: 'replace' }
        );
    const dateRange: DateRange | undefined = { from, to };

    // === handle clear filter ===
    const handleClearFilter = () => {
        setDateRangeAndOption(null);
        setBusinessLocation(null);
        setSaleSerialId('');
        setCreatedBy(null);
    };
    const { profile } = useLoggedInUser();
    // === get all purchases ===
    const { data, isLoading, isFetching } = useGetAllPosSalesQuery({
        page,
        limit,
        business_location_id: businessLocation,
        sale_serial_id: debouncedSaleSerialId,
        created_by: createdBy,
        startDate: from?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        endDate: to?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    });
    const posSales = data?.data?.posSales;
    const posSalesMeta = data?.data?.meta;

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get all staffs ===
    const { data: staffData } = useGetAllStaffsQuery({
        page: 1,
        limit: 100,
        role: Object.values(USER_ROLE)
    });
    const staffs = staffData?.data?.data;
    const formatedStaffs = staffs?.map((staff: Partial<TUser>) => ({
        full_name: staff?.full_name,
        _id: staff?._id,
        role: staff?.role
    }));

    // === get pos sale reports ===
    const {
        data: posReportData,
        isLoading: posReportLoading,
        isFetching: posReportFetching
    } = useGetPosSalesReportQuery({
        business_location_id: businessLocation,
        created_by: createdBy,
        startDate: from?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        endDate: to?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    });
    const posSalesReport = posReportData?.data;

    // === lazy query for full sales data ===
    const [fetchAllSales, { isFetching: isDownloading }] =
        useLazyGetAllPosSalesQuery();

    // =================== PDF ===================
    const handleDownloadSalesPDF = async () => {
        try {
            const { data } = await fetchAllSales({
                business_location_id: businessLocation,
                sale_serial_id: debouncedSaleSerialId,
                page: 1,
                limit: posSalesMeta?.total || 100000,
                startDate: dateRange?.from?.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                endDate: dateRange?.to?.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }).unwrap();

            const allSales = data?.posSales || [];
            if (!allSales.length) return;

            const fmtTk = (n: any) =>
                `${Math.round(Number(n || 0)).toLocaleString()} Tk`;

            // ---- robust fallbacks for totals ----
            const computedTotalProfit = allSales.reduce(
                (s: number, x: any) => s + Number(x?.profit || 0),
                0
            );
            const computedTotalPurchase = allSales.reduce(
                (s: number, sale: any) =>
                    s +
                    (sale?.products || []).reduce(
                        (pSum: number, p: any) =>
                            pSum + Number(p?.total_cost || 0),
                        0
                    ),
                0
            );

            const report = {
                totalSales:
                    posSalesReport?.totalSales ||
                    allSales.reduce(
                        (s: number, x: any) =>
                            s + Number(x?.sub_total || x?.total_amount || 0),
                        0
                    ),
                totalProfit: Number(
                    posSalesReport?.totalProfit ?? computedTotalProfit
                ),
                totalPurchase: Number(
                    posSalesReport?.totalCost ?? computedTotalPurchase
                ),
                totalQuantity:
                    data?.report?.totalQuantity ??
                    data?.totalQuantity ??
                    allSales.reduce(
                        (sum: number, sale: any) =>
                            sum +
                            (sale?.products || []).reduce(
                                (pSum: number, p: any) =>
                                    pSum + Number(p?.quantity || 0),
                                0
                            ),
                        0
                    ),
                openingStock: posSalesReport?.openingStock || {
                    current_stock_value_by_purchase_rate: 0,
                    potential_sale_value_by_sale_price: 0,
                    potential_profit_value_by_sale_price: 0,
                    categories: []
                },
                closingStock: posSalesReport?.closingStock || {
                    current_stock_value_by_purchase_rate: 0,
                    potential_sale_value_by_sale_price: 0,
                    potential_profit_value_by_sale_price: 0,
                    categories: []
                }
            };

            // === PDF (LANDSCAPE) ===
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const centerX = pageW / 2;
            const margin = { left: 12, right: 12, top: 16, bottom: 12 };

            const selectedLocation =
                businessLocationData?.data?.businessLocations?.find(
                    (loc: any) => loc._id === businessLocation
                );
            const locationName = selectedLocation?.name || 'All Locations';
            const generatedByName = profile?.full_name || 'Unknown';
            const generatedAt = format(new Date(), 'dd/MM/yyyy hh:mm a');
            const rangeLine =
                dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(
                          dateRange.to,
                          'dd/MM/yyyy'
                      )}`
                    : '';

            // Header (first page only)
            doc.setFontSize(16);
            doc.text('Griipbuddy', centerX, 15, { align: 'center' });
            doc.setFontSize(13);
            doc.text('Sales Report', centerX, 22, { align: 'center' });
            doc.setFontSize(13);
            doc.text(locationName, centerX, 29, { align: 'center' });
            if (rangeLine)
                doc.text(rangeLine, centerX, 35, { align: 'center' });
            doc.setFontSize(10);
            doc.text(
                `Generated by ${generatedByName} at ${generatedAt}`,
                margin.left,
                38
            );

            const skusCell = (sale: any) => {
                const arr = (sale?.products ?? [])
                    .map(
                        (p: any) =>
                            `${p?.selected_variant?.sku} (Qty ${p?.quantity})`
                    )
                    .filter(Boolean);
                const seen = new Set<string>();
                const uniq = arr.filter((s: string) =>
                    seen.has(s) ? false : seen.add(s)
                );
                return uniq.join(', ') || '—';
            };

            autoTable(doc, {
                startY: 42,
                margin,
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: {
                    fillColor: [10, 51, 67],
                    textColor: [255, 255, 255]
                },
                theme: 'grid',
                head: [
                    [
                        'Date',
                        'Sale Id',
                        'Total Qty',
                        'Items SKU',
                        'Total Paid',
                        // "Purchase Price", // REMOVED from PDF too
                        'Total Profit',
                        'Total Discount',
                        'Total Amount',
                        'Sell Due',
                        'Payment Status',
                        'Payment Method',
                        'Added By',
                        'Sell Note',
                        'Payment Note'
                    ]
                ],
                body: allSales.map((sale: any) => [
                    sale?.sale_date
                        ? `${format(new Date(sale.sale_date), 'dd/MM/yyyy')}\n${format(
                              new Date(sale.sale_date),
                              'hh:mm a'
                          )}`
                        : '-',
                    sale?.sale_serial_id ? `#${sale?.sale_serial_id}` : '-',
                    (sale?.products ?? []).reduce(
                        (sum: number, p: any) => sum + Number(p?.quantity || 0),
                        0
                    ),
                    skusCell(sale),
                    fmtTk(sale?.paid_amount),
                    // fmtTk( // REMOVED purchase price from PDF
                    //   (sale?.products ?? []).reduce(
                    //     (sum: number, p: any) => sum + (Number(p?.total_cost) || 0),
                    //     0
                    //   )
                    // ),
                    fmtTk(sale?.profit),
                    fmtTk(sale?.total_discount),
                    fmtTk(sale?.sub_total ?? sale?.total_amount),
                    fmtTk(sale?.due_amount),
                    sale?.payment_status || '-',
                    sale?.payment_method || '-',
                    sale?.created_by?.[0]?.full_name ||
                        sale?.created_by?.full_name ||
                        '-',
                    sale?.sale_note || '-',
                    sale?.payment_note || '-'
                ]),
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 14 },
                    2: { cellWidth: 12, halign: 'center' },
                    3: { cellWidth: 26 },
                    4: { cellWidth: 20 }, // Total Paid
                    5: { cellWidth: 20 }, // Total Profit (was 6, now 5)
                    6: { cellWidth: 18 }, // Total Discount (was 7, now 6)
                    7: { cellWidth: 20 }, // Total Amount (was 8, now 7)
                    8: { cellWidth: 14 }, // Sell Due (was 9, now 8)
                    9: { cellWidth: 18 }, // Payment Status (was 10, now 9)
                    10: { cellWidth: 18 }, // Payment Method (was 11, now 10)
                    11: { cellWidth: 18 }, // Added By (was 12, now 11)
                    12: { cellWidth: 18 }, // Sell Note (was 13, now 12)
                    13: { cellWidth: 18 } // Payment Note (was 14, now 13)
                }
            });

            // === SUMMARY area ===
            let y = (doc as any).lastAutoTable.finalY + 12;
            const usableBottom = pageH - margin.bottom;
            const neededHeight = 62;
            if (y + neededHeight > usableBottom) {
                doc.addPage();
                y = margin.top;
            }

            // Category-wise text (unchanged)
            const cats =
                (posSalesReport as any)?.soldByCategory ??
                report?.closingStock?.categories ??
                [];
            const catParts = Array.isArray(cats)
                ? cats
                      .map((c: any) => {
                          const name = c?.category_name || c?.name || '';
                          const sold = Math.round(
                              Number(c?.total_sold ?? c?.sold ?? 0)
                          );
                          return name && sold > 0 ? `${name} ${sold}` : null;
                      })
                      .filter(Boolean)
                : [];
            const soldLine =
                catParts.length > 0
                    ? `Total Items Sold: ${catParts.join(' , ')}`
                    : `Total Items Sold: ${report.totalQuantity || 0}`;

            doc.setFontSize(11);
            doc.text(soldLine, margin.left, y);

            const totalSell = fmtTk(report.totalSales || 0);
            // const totalPurchase = fmtTk(report.totalPurchase || 0);
            const totalProfit = fmtTk(report.totalProfit || 0);

            // center: Total Sell
            doc.text(`Total Sell Value: ${totalSell}`, centerX, y, {
                align: 'center'
            });
            // right: Purchase + Profit
            // doc.text(
            //   `Total Purchase Value: ${totalPurchase}    Total Profit: ${totalProfit}`,
            //   pageW - margin.right,
            //   y,
            //   { align: "right" }
            // );
            doc.text(` Total Profit: ${totalProfit}`, pageW - margin.right, y, {
                align: 'right'
            });

            const y2 = y + 6;
            doc.line(margin.left, y2, pageW - margin.right, y2);

            // === Opening / Closing Stock (unchanged) ===
            const renderStockBlock = (
                title: string,
                x: number,
                yTop: number,
                stock: any
            ) => {
                const lh = 6;
                doc.setFontSize(12);
                doc.text(title, x, yTop);
                doc.setFontSize(10);
                let yy = yTop + lh;

                const categories: any[] = Array.isArray(stock?.categories)
                    ? stock.categories
                    : [];
                if (categories.length) {
                    categories.forEach((c) => {
                        doc.text(
                            `${c?.category_name || '-'}: ${Math.round(
                                c?.total_available_quantity || 0
                            )} Pair/pcs`,
                            x,
                            yy
                        );
                        yy += lh;
                    });
                } else {
                    doc.text('—', x, yy);
                    yy += lh;
                }

                yy += 2;
                const purchaseVal = fmtTk(
                    stock?.current_stock_value_by_purchase_rate || 0
                );
                const potentialSaleVal = fmtTk(
                    stock?.potential_sale_value_by_sale_price || 0
                );

                doc.text(
                    `Total Stock Value by Purchase: ${purchaseVal}`,
                    x,
                    yy
                );
                yy += lh;
                doc.text(
                    `Total Stock Value by Sell: ${potentialSaleVal}`,
                    x,
                    yy
                );
                yy += lh;

                return yy;
            };

            const blockTop = y2 + 8;
            const leftX = margin.left;
            const rightX = centerX + 10;
            const endLeft = renderStockBlock(
                'Opening Stock',
                leftX,
                blockTop,
                report.openingStock
            );
            const endRight = renderStockBlock(
                'Closing Stock',
                rightX,
                blockTop,
                report.closingStock
            );
            doc.line(
                centerX,
                blockTop - 4,
                centerX,
                Math.max(endLeft, endRight)
            );

            doc.save(
                `sales_report_${locationName}_${new Date().toLocaleDateString()}.pdf`
            );
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    // =================== EXCEL ===================
    const handleDownloadExcelReport = async () => {
        try {
            const { data } = await fetchAllSales({
                business_location_id: businessLocation,
                sale_serial_id: debouncedSaleSerialId,
                page: 1,
                limit: posSalesMeta?.total || 100000,
                startDate: dateRange?.from?.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                endDate: dateRange?.to?.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }).unwrap();

            const allSales = data?.posSales || [];
            if (!allSales.length) return;

            const fmtTkNum = (n: any) => Math.round(Number(n || 0));
            const joinSkus = (sale: any) => {
                const arr = (sale?.products ?? [])
                    .map(
                        (p: any) =>
                            `${p?.selected_variant?.sku} (Qty ${p?.quantity})`
                    )
                    .filter(Boolean);
                const seen = new Set<string>();
                const uniq = arr.filter((s: string) =>
                    seen.has(s) ? false : seen.add(s)
                );
                return uniq.join(', ') || '—';
            };

            // Robust totals (same logic as PDF)
            const computedTotalProfit = allSales.reduce(
                (s: number, x: any) => s + Number(x?.profit || 0),
                0
            );
            const computedTotalPurchase = allSales.reduce(
                (s: number, sale: any) =>
                    s +
                    (sale?.products || []).reduce(
                        (pSum: number, p: any) =>
                            pSum + Number(p?.total_cost || 0),
                        0
                    ),
                0
            );

            const report = {
                totalSales:
                    posSalesReport?.totalSales ||
                    allSales.reduce(
                        (s: number, x: any) =>
                            s + Number(x?.sub_total || x?.total_amount || 0),
                        0
                    ),
                totalProfit: Number(
                    posSalesReport?.totalProfit ?? computedTotalProfit
                ),
                totalPurchase: Number(
                    posSalesReport?.totalCost ?? computedTotalPurchase
                ),
                totalQuantity:
                    data?.report?.totalQuantity ??
                    data?.totalQuantity ??
                    allSales.reduce(
                        (sum: number, sale: any) =>
                            sum +
                            (sale?.products || []).reduce(
                                (pSum: number, p: any) =>
                                    pSum + Number(p?.quantity || 0),
                                0
                            ),
                        0
                    ),
                openingStock: posSalesReport?.openingStock || {
                    current_stock_value_by_purchase_rate: 0,
                    potential_sale_value_by_sale_price: 0,
                    potential_profit_value_by_sale_price: 0,
                    categories: []
                },
                closingStock: posSalesReport?.closingStock || {
                    current_stock_value_by_purchase_rate: 0,
                    potential_sale_value_by_sale_price: 0,
                    potential_profit_value_by_sale_price: 0,
                    categories: []
                }
            };

            const selectedLocation =
                businessLocationData?.data?.businessLocations?.find(
                    (loc: any) => loc._id === businessLocation
                );
            const locationName = selectedLocation?.name || 'All Locations';
            const generatedByName = profile?.full_name || 'Unknown';
            const generatedAt = format(new Date(), 'dd/MM/yyyy hh:mm a');
            const rangeLine =
                dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(
                          dateRange.to,
                          'dd/MM/yyyy'
                      )}`
                    : '';

            const HEADER_FILL = '0A3342';
            const WHITE = 'FFFFFF';

            const aoa: any[][] = [];
            aoa.push(['Griipbuddy']);
            aoa.push(['Sales Report']);
            aoa.push([locationName]);
            aoa.push([rangeLine || '']);
            aoa.push([`Generated by ${generatedByName} at ${generatedAt}`]);
            aoa.push([]);

            const tableHeader = [
                'Date',
                'Sale Id',
                'Total Qty',
                'Items SKU',
                'Total Paid',
                'Total Profit',
                'Total Discount',
                'Total Amount',
                'Sell Due',
                'Payment Status',
                'Payment Method',
                'Added By',
                'Sell Note',
                'Payment Note'
            ];
            aoa.push(tableHeader);

            for (const sale of allSales) {
                // REMOVE purchasePrice calculation entirely
                aoa.push([
                    sale?.sale_date
                        ? `${format(new Date(sale.sale_date), 'dd/MM/yyyy')} ${format(
                              new Date(sale.sale_date),
                              'hh:mm a'
                          )}`
                        : '-',
                    sale?.sale_serial_id ? `#${sale?.sale_serial_id}` : '-',
                    (sale?.products ?? []).reduce(
                        (sum: number, p: any) => sum + Number(p?.quantity || 0),
                        0
                    ),
                    joinSkus(sale),
                    fmtTkNum(sale?.paid_amount),
                    // REMOVED purchase price column entirely
                    fmtTkNum(sale?.profit),
                    fmtTkNum(sale?.total_discount),
                    fmtTkNum(sale?.sub_total ?? sale?.total_amount),
                    fmtTkNum(sale?.due_amount),
                    sale?.payment_status || '-',
                    sale?.payment_method || '-',
                    sale?.created_by?.[0]?.full_name ||
                        sale?.created_by?.full_name ||
                        '-',
                    sale?.sale_note || '-',
                    sale?.payment_note || '-'
                ]);
            }

            // Summary line
            aoa.push([]);
            const cats =
                (posSalesReport as any)?.soldByCategory ??
                report?.closingStock?.categories ??
                [];
            const catParts = Array.isArray(cats)
                ? cats
                      .map((c: any) => {
                          const name = c?.category_name || c?.name || '';
                          const sold = Math.round(
                              Number(c?.total_sold ?? c?.sold ?? 0)
                          );
                          return name && sold > 0 ? `${name} ${sold}` : null;
                      })
                      .filter(Boolean)
                : [];
            const soldLine =
                catParts.length > 0
                    ? `Total Items Sold: ${catParts.join(' , ')}`
                    : `Total Items Sold: ${report.totalQuantity || 0}`;

            aoa.push([
                soldLine,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                `Total Sell Value: ${fmtTkNum(report.totalSales).toLocaleString()} Tk`,
                `Total Purchase Value: ${fmtTkNum(
                    report.totalPurchase
                ).toLocaleString()} Tk`,
                `Total Profit: ${fmtTkNum(report.totalProfit).toLocaleString()} Tk`
            ]);

            aoa.push([]);
            aoa.push([
                'Opening Stock',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                'Closing Stock'
            ]);

            const maxCatRows = Math.max(
                Array.isArray(report.openingStock?.categories)
                    ? report.openingStock.categories.length
                    : 0,
                Array.isArray(report.closingStock?.categories)
                    ? report.closingStock.categories.length
                    : 0
            );

            for (let i = 0; i < Math.max(1, maxCatRows); i++) {
                const o = report.openingStock?.categories?.[i];
                const c = report.closingStock?.categories?.[i];
                aoa.push([
                    o
                        ? `${o?.category_name || '-'}: ${Math.round(
                              o?.total_available_quantity || 0
                          )} Pair/pcs`
                        : i === 0
                          ? '—'
                          : '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    c
                        ? `${c?.category_name || '-'}: ${Math.round(
                              c?.total_available_quantity || 0
                          )} Pair/pcs`
                        : i === 0
                          ? '—'
                          : ''
                ]);
            }

            aoa.push([
                `Total Stock Value by Purchase: ${fmtTkNum(
                    report.openingStock?.current_stock_value_by_purchase_rate ||
                        0
                ).toLocaleString()} Tk`,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                `Total Stock Value by Purchase: ${fmtTkNum(
                    report.closingStock?.current_stock_value_by_purchase_rate ||
                        0
                ).toLocaleString()} Tk`
            ]);
            aoa.push([
                `Total Stock Value by Sell: ${fmtTkNum(
                    report.openingStock?.potential_sale_value_by_sale_price || 0
                ).toLocaleString()} Tk`,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                `Total Stock Value by Sell: ${fmtTkNum(
                    report.closingStock?.potential_sale_value_by_sale_price || 0
                ).toLocaleString()} Tk`
            ]);

            const ws = XLSX.utils.aoa_to_sheet(aoa);

            const lastCol = tableHeader.length - 1; // Now 13 columns
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: lastCol } },
                { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } },
                {
                    s: { r: 7 + allSales.length + 1, c: 0 },
                    e: { r: 7 + allSales.length + 1, c: 7 }
                }
            ];

            ws['!cols'] = [
                { wch: 38 }, // Date
                { wch: 22 }, // Sale Id
                { wch: 20 }, // Total Qty
                { wch: 32 }, // Items SKU
                { wch: 24 }, // Total Paid
                { wch: 14 }, // Total Profit
                { wch: 14 }, // Total Discount
                { wch: 14 }, // Total Amount
                { wch: 12 }, // Sell Due
                { wch: 14 }, // Payment Status
                { wch: 14 }, // Payment Method
                { wch: 16 }, // Added By
                { wch: 58 }, // Sell Note
                { wch: 58 } // Payment Note
            ];

            const setCell = (ref: string, props: any) => {
                if (!ws[ref]) return;
                ws[ref].s = { ...(ws[ref].s || {}), ...props };
            };

            for (let r = 0; r <= 4; r++) {
                const ref = XLSX.utils.encode_cell({ r, c: 0 });
                setCell(ref, {
                    alignment: { horizontal: 'center', vertical: 'center' }
                });
                if (r === 0) setCell(ref, { font: { bold: true, sz: 16 } });
                if (r === 1) setCell(ref, { font: { bold: true, sz: 13 } });
                if (r === 2) setCell(ref, { font: { bold: true, sz: 12 } });
                if (r === 3) setCell(ref, { font: { sz: 11 } });
                if (r === 4) setCell(ref, { font: { sz: 10 } });
            }

            for (let c = 0; c <= lastCol; c++) {
                const ref = XLSX.utils.encode_cell({ r: 6, c });
                setCell(ref, {
                    font: { bold: true, color: { rgb: WHITE } },
                    fill: { fgColor: { rgb: HEADER_FILL } },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center',
                        wrapText: true
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                        left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                        right: { style: 'thin', color: { rgb: 'CCCCCC' } },
                        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }
                    }
                });
            }

            // Number formats for money columns (indices updated)
            const moneyCols = [4, 5, 6, 7, 8]; // Total Paid, Total Profit, Total Discount, Total Amount, Sell Due
            const firstDataRow = 7;
            const lastDataRow = firstDataRow + allSales.length - 1;
            for (let r = firstDataRow; r <= lastDataRow; r++) {
                moneyCols.forEach((c) => {
                    const ref = XLSX.utils.encode_cell({ r, c });
                    if (ws[ref]) {
                        ws[ref].t = 'n';
                        ws[ref].z = '#,##0" Tk"';
                        setCell(ref, { alignment: { horizontal: 'right' } });
                    }
                });
                // Wrap text columns
                [0, 3, 11, 12, 13].forEach((c) => {
                    const ref = XLSX.utils.encode_cell({ r, c });
                    if (ws[ref])
                        setCell(ref, { alignment: { wrapText: true } });
                });
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
            XLSX.writeFile(
                wb,
                `sales_report_${locationName}_${new Date().toLocaleDateString()}.xlsx`
            );
        } catch (err) {
            console.error('Download Excel error:', err);
        }
    };

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    // === loading and persmission error card ===
    // if (!isPermissionLoading && !hasPermission) {
    //   return <PermissionErrorCard />;
    // }
    // if (isPermissionLoading) {
    //   return <PermissionLoaderCard />;
    // }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    {' '}
                    Sales Reports{' '}
                    {selectedOption !== 'All Time' && (
                        <>
                            for{' '}
                            <span className='text-emerald-600'>
                                {' '}
                                {dateRange?.from?.toDateString()}
                            </span>{' '}
                            {dateRange?.from?.toLocaleDateString('en-CA', {
                                year: 'numeric',
                                day: '2-digit',
                                month: '2-digit'
                            }) !==
                                dateRange?.to?.toLocaleDateString('en-CA', {
                                    year: 'numeric',
                                    day: '2-digit',
                                    month: '2-digit'
                                }) && (
                                <>
                                    to{' '}
                                    <span className='text-emerald-600'>
                                        {dateRange?.to?.toDateString()}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </h1>
            </div>
            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion type='single' collapsible defaultValue='item-1'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger
                            isHideChevron={true}
                            className='hover: cursor-pointer rounded-b-none border-b p-4 text-lg font-medium hover:no-underline'
                        >
                            <span className='flex items-center gap-2 text-emerald-600'>
                                <Filter className='size-5' /> Filter
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='grid gap-6 px-4 pt-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6'>
                                {/* filter by business location */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Business Location
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={
                                            businessLocation
                                                ? businessLocation
                                                : 'all'
                                        }
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {businessLocationOptions?.map(
                                                (
                                                    businessLocation: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            businessLocation?.value
                                                        }
                                                    >
                                                        {
                                                            businessLocation?.label
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* search by sale serial id */}
                                <div className='mt-1.5 space-y-2'>
                                    <Label>Sale Serial Id</Label>
                                    <Input
                                        placeholder='Search by sale id'
                                        onChange={(e) =>
                                            setSaleSerialId(e.target.value)
                                        }
                                        value={saleSerialId}
                                    />
                                </div>
                                {/* filter by created by */}
                                <div className='mt-1.5 space-y-2'>
                                    <Label>Sale Created By</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setCreatedBy(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select user' />
                                        </SelectTrigger>

                                        <SelectContent className='max-h-96'>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {formatedStaffs?.map(
                                                (
                                                    staff: Partial<TUser>,
                                                    index: number
                                                ) => {
                                                    return (
                                                        <SelectItem
                                                            key={index}
                                                            value={
                                                                staff?._id as string
                                                            }
                                                        >
                                                            {staff?.full_name}
                                                            <Badge
                                                                variant={getRoleBadgeVariant(
                                                                    staff?.role as IRoles
                                                                )}
                                                                className='text-[10px]'
                                                            >
                                                                {staff?.role &&
                                                                    staff?.role.replace(
                                                                        /_/g,
                                                                        ' '
                                                                    )}
                                                            </Badge>
                                                        </SelectItem>
                                                    );
                                                }
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* filter by date range */}
                                <div className='space-y-2 lg:col-span-2'>
                                    <p className='text-sm font-medium'>
                                        Date Range
                                    </p>
                                    <DateRangeCalendar
                                        value={dateRange}
                                        selectedOption={selectedOption}
                                        onDateChange={(newDateRange) => {
                                            if (newDateRange) {
                                                setDateRangeAndOption({
                                                    from: newDateRange.from,
                                                    to: newDateRange.to
                                                });
                                            }
                                        }}
                                        onOptionChange={(newOption) => {
                                            setDateRangeAndOption({
                                                selectedOption: newOption
                                            });
                                        }}
                                        defaultOption='Today'
                                    />
                                </div>

                                {/* handle clear filter */}
                                <div className='flex h-full items-end justify-end'>
                                    <Button onClick={handleClearFilter}>
                                        Clear Filter
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <SaleReport
                posSalesReport={posSalesReport}
                isLoading={posReportLoading}
                isFetching={posReportFetching}
            />
            {/* download report */}
            <div className='ms-auto flex w-fit items-center gap-4'>
                <Button
                    variant='outline'
                    size='lg'
                    className='w-fit gap-1'
                    onClick={handleDownloadExcelReport}
                    disabled={!posSalesReport || isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader className='size-4 animate-spin' />
                            Donwloading...
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className='size-4' />
                            Download Excel
                        </>
                    )}
                </Button>
                <Button
                    variant='green'
                    onClick={handleDownloadSalesPDF}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader className='animate-spin' /> Preparing...
                        </>
                    ) : (
                        <>
                            <File className='size-4' /> Download PDF
                        </>
                    )}
                </Button>
            </div>
            {/* table */}
            <SalesTable
                sales={posSales}
                hasPermission={hasPermission}
                isPermissionLoading={isPermissionLoading}
                isLoading={isLoading}
                isFetching={isFetching}
            />
            {/* pagination */}
            {posSalesMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={posSalesMeta?.total}
                    />
                </div>
            )}
        </section>
    );
};

const AllPosSalesPage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <AllPosSalesComponent />
        </Suspense>
    );
};

export default AllPosSalesPage;
