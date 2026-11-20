// "use client";

// import Pagination from "@/admin/components/shared/pagination";
// import { PermissionErrorCard } from "@/admin/components/shared/permission-error-card";
// import { PermissionLoaderCard } from "@/admin/components/shared/permission-loader-card";
// import { Button } from "@/admin/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
// import { Input } from "@/admin/components/ui/input";
// import { Label } from "@/admin/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/admin/components/ui/select";
// import useDebounce from "@/admin/hooks/use-debounce";
// import { useHasPermission } from "@/admin/hooks/use-has-permission";
// import { useGetAllBusinessLocationsQuery } from "@/admin/redux/api-queries/business-location-api";
// import {
//   useGetAllStockReportsQuery,
//   useGetAllStocksSubcategoryQuery,
// } from "@/admin/redux/api-queries/stock-api";
// import { IBusiness_location } from "@/admin/types/business-location";
// import { PermissionEnum } from "@/admin/types/permistion";
// import { generateExcel } from "@/admin/utils/excel-generator";
// import { generateFullPDF } from "@/admin/utils/pdf-generator";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import {
//   Badge,
//   ChevronsUpDown,
//   Command,
//   DollarSign,
//   File,
//   FileSpreadsheet,
//   Loader,
//   ShoppingCart,
//   TrendingUp,
//   X,
// } from "lucide-react";
// import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
// import { Suspense, useEffect, useRef, useState } from "react";
// import { StocksReportTable } from "./_components/stocks-report-table";
// import { Checkbox } from "@radix-ui/react-checkbox";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@radix-ui/react-popover";
// import {
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "cmdk";

// const StockReportPageComponent = () => {
//   // === api query states ===
//   const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
//   const [limit, setLimit] = useState<string | number>(20);
//   const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

//   const [isPageChanging, setIsPageChanging] = useState(false);

//   // === nuqs state for business location ===
//   const [businessLocation, setBusinessLocation] =
//     useQueryState("businessLocation");
//   // === check permissions ===
//   const { hasPermission, isPermissionLoading } = useHasPermission({
//     permissions: [
//       PermissionEnum.PURCHEASE_VALUE,
//       PermissionEnum.POTENTIAL_PROFIT,
//     ],
//   });

//   // === nuqs state for sale id ===
//   const [skuQuery, setSkuQuery] = useQueryState(
//     "skuQuery",
//     parseAsString.withDefault("")
//   );
//   const [searchQuery, setSearchQuery] = useQueryState(
//     "searchQuery",
//     parseAsString.withDefault("")
//   );

//   // === ADD: Sort states ===
//   const [sortBy, setSortBy] = useQueryState(
//     "sortBy",
//     parseAsString.withDefault("available_quantity")
//   );
//   const [sortOrder, setSortOrder] = useQueryState(
//     "sortOrder",
//     parseAsString.withDefault("desc")
//   );

//   const debouncedSkuQuery = useDebounce(skuQuery);
//   const debouncedSearchQuery = useDebounce(searchQuery);

//   const [downloadState, setDownloadState] = useState({
//     stockSummary: false,
//     fullPdf: false,
//     excel: false,
//   });

//   // Enhanced cache implementation
//   const cachedStockDataRef = useRef<{
//     data: any;
//     timestamp: number;
//     key: string;
//   } | null>(null);

//   const isDownloadingRef = useRef(false);

//   // === get all business locations ===
//   const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});

//   const businessLocationOptions =
//     businessLocationData?.data?.businessLocations?.map(
//       (businessLocation: IBusiness_location) => ({
//         label: businessLocation?.name,
//         value: businessLocation?._id,
//       })
//     ) || [];

//   // === MODIFIED: Determine when to skip API call ===
//   // Only skip if ALL of these are true:
//   // 1. No business location selected (or it's empty string)
//   // 2. No SKU search term
//   // 3. No general search term
//   const hasSearchTerm = debouncedSkuQuery || debouncedSearchQuery;
//   const shouldSkip = !businessLocation && !hasSearchTerm;

//   // When searching, use "all" locations if no specific location is selected
//   // const locationParam = businessLocation
//   //   ? businessLocation === "all"
//   //     ? undefined
//   //     : businessLocation
//   //   : hasSearchTerm
//   //   ? undefined
//   //   : undefined; // When searching with no location, fetch from all locations

//   // Update your API call parameter
//   const locationParam = businessLocation
//     ? businessLocation === "all"
//       ? undefined
//       : businessLocation.split(",") // Split comma-separated string into array
//     : undefined;

//   // In your useGetAllStockReportsQuery

//   //=== Fetch stock reports ===
//   const { data, isLoading, isFetching } = useGetAllStockReportsQuery(
//     {
//       page,
//       limit,
//       q: debouncedSearchQuery,
//       sku: debouncedSkuQuery,
//       businessLocationId: locationParam,
//       businessLocationIds:businessLocationIds,
//       sortBy: sortBy || undefined,
//       sortOrder: sortOrder || undefined,
//     },
//     {
//       skip: shouldSkip,
//     }
//   );

//   //=== Fetch stock subcategories ===
//   const { data: ubcategoryData } = useGetAllStocksSubcategoryQuery(
//     {
//       page,
//       limit,
//       q: debouncedSearchQuery || debouncedSkuQuery, // Use sku as search term if no general search
//       sku: debouncedSkuQuery,
//       businessLocationId: locationParam,
//       sortBy: sortBy || undefined,
//       sortOrder: sortOrder || undefined,
//     },
//     {
//       skip: shouldSkip,
//     }
//   );
//   const categoryStockData = ubcategoryData?.data?.data;

//   // === FIX: Use the existing data instead of making new API calls ===
//   const stocks = data?.data?.data;
//   const stocksMeta = data?.data?.meta;
//   const stocksReport = data?.data?.summation;

//   // Calculate manual summary if API doesn't provide filtered summary
//   const calculateManualSummary = () => {
//     if (!stocks || stocks.length === 0) {
//       return {
//         total_products: 0,
//         total_available_quantity: 0,
//         summary_by_category: [],
//         total_current_stock_purchase_value: 0,
//         total_sale_value: 0,
//         total_sold_value: 0,
//       };
//     }

//     // Calculate summary from filtered stocks
//     const summary_by_category: Record<string, any> = {};
//     let total_available_quantity = 0;
//     let total_current_stock_purchase_value = 0;
//     let total_sale_value = 0;
//     let total_sold_value = 0;

//     stocks.forEach((stock: any) => {
//       const categoryName = stock?.product?.category?.name || "Uncategorized";
//       const availableQty = stock?.available_quantity || 0;
//       const purchaseValue = stock?.purchase_price || 0;
//       const saleValue = stock?.sale_price || 0;
//       const soldQty = stock?.total_sold || 0;

//       if (!summary_by_category[categoryName]) {
//         summary_by_category[categoryName] = {
//           name: categoryName,
//           total_available_quantity: 0,
//           total_sold: 0,
//         };
//       }

//       summary_by_category[categoryName].total_available_quantity +=
//         availableQty;
//       summary_by_category[categoryName].total_sold += soldQty;

//       total_available_quantity += availableQty;
//       total_current_stock_purchase_value += availableQty * purchaseValue;
//       total_sale_value += availableQty * saleValue;
//       total_sold_value += soldQty * saleValue;
//     });

//     return {
//       total_products: stocks.length,
//       total_available_quantity,
//       summary_by_category: Object.values(summary_by_category),
//       total_current_stock_purchase_value,
//       total_sale_value,
//       total_sold_value,
//     };
//   };

//   // Use API summary if available, otherwise calculate manually
//   const filteredSummary = stocksReport || calculateManualSummary();

//   // Debug log to check what data we're getting
//   useEffect(() => {}, [
//     stocks,
//     stocksReport,
//     skuQuery,
//     debouncedSkuQuery,
//     searchQuery,
//     debouncedSearchQuery,
//     businessLocation,
//   ]);

//   // Custom business location handler that ALWAYS resets page
//   // const handleBusinessLocationChange = (value: string) => {
//   //   setBusinessLocation(value);
//   //   setPage(1);
//   // };
//   const handleBusinessLocationChange = (value: string) => {
//     setBusinessLocation(value);
//     setPage(1);

//     // Update selectedLocations state for UI
//     if (value === "all") {
//       setSelectedLocations([]);
//     } else if (value.includes(",")) {
//       setSelectedLocations(value.split(","));
//     } else if (value) {
//       setSelectedLocations([value]);
//     } else {
//       setSelectedLocations([]);
//     }
//   };

//   // MODIFIED: Handle search inputs - automatically fetch from all locations when searching
//   const handleSkuChange = (value: string) => {
//     setSkuQuery(value);
//     // When user starts typing in SKU search, we want to fetch data
//     // The shouldSkip logic above will handle this
//   };

//   const handleSearchChange = (value: string) => {
//     setSearchQuery(value);
//     // When user starts typing in general search, we want to fetch data
//     // The shouldSkip logic above will handle this
//   };

//   const handlePageChange = (newPage: number) => {
//     setIsPageChanging(true);
//     setPage(newPage);
//     setTimeout(() => setIsPageChanging(false), 500);
//   };

//   useEffect(() => {
//     setPage(1);
//   }, [debouncedSearchQuery, debouncedSkuQuery, businessLocation, setPage]);

//   // Generate cache key based on current filters
//   const generateCacheKey = () => {
//     return `${businessLocation}-${debouncedSearchQuery}-${debouncedSkuQuery}-${sortBy}-${sortOrder}`;
//   };

//   // === FIX: Use existing data for downloads instead of making new API calls ===
//   const getStocksDataForDownload = () => {
//     const cacheKey = generateCacheKey();
//     const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//     // Check cache first - using ref for immediate access
//     if (
//       cachedStockDataRef.current &&
//       cachedStockDataRef.current.key === cacheKey &&
//       Date.now() - cachedStockDataRef.current.timestamp < CACHE_DURATION
//     ) {
//       return cachedStockDataRef.current.data;
//     }

//     // Use the current data from the main query
//     const currentData = {
//       data: stocks,
//       summation: filteredSummary, // Use filtered summary instead of stocksReport
//       meta: stocksMeta,
//     };
//     // Update cache with current data
//     cachedStockDataRef.current = {
//       data: currentData,
//       timestamp: Date.now(),
//       key: cacheKey,
//     };

//     return currentData;
//   };

//   // Clear cache when filters change
//   useEffect(() => {
//     cachedStockDataRef.current = null;
//   }, [
//     businessLocation,
//     debouncedSearchQuery,
//     debouncedSkuQuery,
//     sortBy,
//     sortOrder,
//   ]);

//   const handleDownload = async (type: "pdf" | "summary" | "excel") => {
//     if (isDownloadingRef.current) {
//       return;
//     }

//     isDownloadingRef.current = true;

//     // Set the specific download state to true
//     const downloadKey =
//       type === "pdf"
//         ? "fullPdf"
//         : type === "summary"
//         ? "stockSummary"
//         : "excel";
//     console.log(" Setting download state to true for:", downloadKey);

//     setDownloadState((prev) => ({
//       ...prev,
//       [downloadKey]: true,
//     }));

//     try {
//       let data;
//       if (type === "summary") {
//         // For summary, use subcategory data directly
//         data = ubcategoryData;
//       } else {
//         // For PDF and Excel, use regular stock data
//         data = getStocksDataForDownload();
//       }

//       if (!data) {
//         return;
//       }

//       // For PDF/Excel, check if we have stock data
//       if (
//         (type === "pdf" || type === "excel") &&
//         (!data.data || data.data.length === 0)
//       ) {
//         console.warn(" No stock data available for download");
//         alert("No stock data available to download");
//         return;
//       }

//       if (type === "pdf") {
//         await generateFullPDF(
//           data,
//           businessLocationData,
//           businessLocation || "all"
//         );
//       } else if (type === "summary") {
//         await generateSummaryPDF(data);
//       } else if (type === "excel") {
//         await generateExcel(
//           data,
//           businessLocationData,
//           businessLocation || "all"
//         );
//       }
//     } catch (err) {
//       console.error(" Download error:", err);
//       alert("Error downloading file");
//     } finally {
//       console.log(" Resetting download state for:", downloadKey);
//       isDownloadingRef.current = false;
//       setDownloadState((prev) => ({
//         ...prev,
//         [downloadKey]: false,
//       }));
//     }
//   };

//   const generateSummaryPDF = async (ubcategoryData: any) => {
//     const allStocks = ubcategoryData?.data?.data || [];
//     const stocksSummarySubCategory =
//       categoryStockData?.summation?.summary_by_subcategory || [];
//     const stocksReportInside = categoryStockData?.summation || {};

//     if (!allStocks.length && stocksSummarySubCategory.length === 0) {
//       console.warn("No data available for download");
//       return;
//     }

//     // === Portrait A4 ===
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // === Header (centered using pageWidth) ===
//     doc.setFontSize(16);
//     doc.text("Griipbuddy", pageWidth / 2, 15, { align: "center" });
//     doc.setFontSize(13);
//     doc.text("Stock Summary Reports", pageWidth / 2, 25, { align: "center" });

//     const selectedLocation =
//       businessLocationData?.data?.businessLocations?.find(
//         (loc: any) => loc._id === businessLocation
//       );

//     let y = 40;
//     if (selectedLocation) {
//       doc.setFontSize(11);
//       doc.text(`Business Location: ${selectedLocation.name}`, 14, y);
//       y += 8;
//     } else if (businessLocation === "all" || hasSearchTerm) {
//       doc.setFontSize(11);
//       doc.text(`Business Location: All Locations`, 14, y);
//       y += 8;
//     }

//     // Add search filter info
//     if (skuQuery) {
//       doc.setFontSize(11);
//       doc.text(`SKU Filter: ${skuQuery}`, 14, y);
//       y += 8;
//     }
//     if (searchQuery) {
//       doc.setFontSize(11);
//       doc.text(`Search Filter: ${searchQuery}`, 14, y);
//       y += 8;
//     }

//     const today = new Date().toLocaleString();
//     doc.text(`Date: ${today}`, 14, y);
//     y += 8;

//     // === TOP SUMMARY (inline, like screenshot) ===
//     if (stocksReportInside) {
//       const totalLine = `Total Qty: ${(
//         stocksReportInside?.summary_by_category ?? []
//       )
//         .map((c: any) => `${c.name} (${c.total_available_quantity} Qty)`)
//         .join(", ")}`;
//       doc.setFont("helvetica", "normal");

//       // Wrap long text to fit page width
//       const splitText = doc.splitTextToSize(totalLine, pageWidth - 28);
//       doc.text(splitText, 14, y);
//       y += 6 * splitText.length;
//     }

//     // === Table ===
//     // Build rows for subcategory summary
//     const tableBody = stocksSummarySubCategory.map((inventory: any) => {
//       const nameWithVariant = `${inventory?.name ?? ""}`;
//       const availableQty = Number(inventory?.total_available_quantity) || 0;
//       // const totalSold = Number(inventory?.total_sold) || 0;
//       const totalPurchaseValue =
//         Number(inventory?.total_current_stock_purchase_value) || 0;
//       const totalSaleValue = Number(inventory?.total_sale_value) || 0;

//       return [
//         nameWithVariant,
//         `${availableQty} Pair/pcs`,
//         `${Number(totalPurchaseValue).toLocaleString()} Tk`,
//         `${Number(totalSaleValue).toLocaleString()} Tk`,
//       ];
//     });

//     // Header for subcategory summary - FIXED COLUMN WIDTHS
//     autoTable(doc, {
//       startY: y + 5,
//       head: [
//         [
//           "Sub Category",
//           "Available Quantity",
//           "Purchase Value",
//           "Total Sale Value", // Fixed typo: "total Sale Value" -> "Total Sale Value"
//         ],
//       ],
//       body: tableBody,
//       styles: {
//         fontSize: 10,
//         cellPadding: 3,
//         overflow: "linebreak",
//       },
//       headStyles: {
//         fillColor: [0, 102, 204],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//       },
//       margin: { left: 14, right: 14 },
//       tableWidth: pageWidth - 28, // Full page width minus margins
//       columnStyles: {
//         0: { cellWidth: (pageWidth - 28) * 0.4 }, // 40% for Sub Category (reduced from 60%)
//         1: { cellWidth: (pageWidth - 28) * 0.2 }, // 20% for Available Quantity
//         2: { cellWidth: (pageWidth - 28) * 0.2 }, // 20% for Purchase Value
//         3: { cellWidth: (pageWidth - 28) * 0.2 }, // 20% for Total Sale Value (ADD THIS LINE)
//       },
//       pageBreak: "auto",
//       didDrawPage: function (data: any) {
//         // Add page number
//         const pageCount = doc.getNumberOfPages();
//         doc.setFontSize(10);
//         doc.text(
//           `Page ${data.pageNumber} of ${pageCount}`,
//           pageWidth / 2,
//           pageHeight - 10,
//           { align: "center" }
//         );
//       },
//     });

//     // === Get where the table ends ===
//     let currentY = (doc as any).lastAutoTable.finalY + 15;

//     // Check if we need new page for summary
//     if (currentY > pageHeight - 50) {
//       doc.addPage();
//       currentY = 20;
//     }

//     // === Summary block BELOW table ===
//     if (stocksReportInside) {
//       doc.setFont("helvetica", "bold");
//       doc.text("Summary:", 14, currentY);

//       doc.setFont("helvetica", "normal");
//       const lineHeight = 6;

//       const summaryLines = [
//         `Current Stock Value (by purchase rate): ${Number(
//           Math.floor(stocksReportInside?.total_current_stock_purchase_value) ||
//             0
//         ).toLocaleString()} TK`,
//         `Potential Sale Value (by sale price): ${Number(
//           Math.floor(stocksReportInside?.total_sale_value) || 0
//         ).toLocaleString()} Tk`,
//         `Potential Profit Value: ${Number(
//           Math.floor(stocksReportInside?.total_sale_value) -
//             Math.floor(
//               stocksReportInside?.total_current_stock_purchase_value
//             ) || 0
//         ).toLocaleString()} Tk`,
//         `Total Sold Value: ${Number(
//           Math.floor(stocksReportInside?.total_sold_value) || 0
//         ).toLocaleString()} Tk`,
//       ];

//       summaryLines.forEach((line, index) => {
//         doc.text(line, 14, currentY + (index + 1) * lineHeight);
//       });

//       currentY += summaryLines.length * lineHeight + 10;
//     }

//     // === Signature Section ===
//     if (currentY > pageHeight - 30) {
//       doc.addPage();
//       currentY = 30;
//     } else {
//       currentY += 10;
//     }

//     const signatureY = currentY;
//     const leftStart = 30;
//     const leftEnd = 80;
//     const rightStart = pageWidth - 80;
//     const rightEnd = pageWidth - 30;

//     doc.setFont("helvetica", "normal");
//     doc.line(leftStart, signatureY, leftEnd, signatureY);
//     doc.line(rightStart, signatureY, rightEnd, signatureY);

//     doc.setFontSize(9);
//     doc.text("Received by", leftStart + 10, signatureY + 5);
//     doc.text("Authorized by", rightStart + 10, signatureY + 5);

//     doc.save(`stocks_summary_report_${new Date().toLocaleDateString()}.pdf`);
//   };

//   // Simplified download handlers
//   const handleDownloadPDF = () => handleDownload("pdf");
//   const handleDownloadStockSummaryPDF = () => handleDownload("summary");
//   const handleDownloadExcel = () => handleDownload("excel");

//   // Dynamic cards that update based on filtered data
//   const cards = [
//     {
//       title: "Current Stock Value (by purchase rate)",
//       value: `${Number(
//         Math.floor(filteredSummary.total_current_stock_purchase_value) || 0
//       ).toLocaleString()} TK`,
//       icon: DollarSign,
//       color: "text-green-600",
//       bgColor: "bg-green-50 dark:bg-green-950/20",
//     },
//     {
//       title: "Potential Sale Value (by sale price)",
//       value: `${Number(
//         Math.floor(filteredSummary.total_sale_value) || 0
//       ).toLocaleString()} Tk`,
//       icon: TrendingUp,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50 dark:bg-blue-950/20",
//     },
//     {
//       title: "Potential Profit Value (by sale price)",
//       value: `${Number(
//         Math.floor(filteredSummary.total_sale_value) -
//           Math.floor(filteredSummary.total_current_stock_purchase_value) || 0
//       ).toLocaleString()} Tk`,
//       icon: TrendingUp,
//       color: "text-orange-600",
//       bgColor: "bg-orange-50 dark:bg-orange-950/20",
//     },
//     {
//       title: "Total Sold Value (sell)",
//       value: `${Number(
//         Math.floor(filteredSummary.total_sold_value) || 0
//       ).toLocaleString()} Tk`,
//       icon: ShoppingCart,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50 dark:bg-purple-950/20",
//     },
//   ];

//   // Check if we have data from API
//   const hasData = stocks && stocks.length > 0;
//   const showSummary = hasData;

//   return (
//     <section className="flex flex-col gap-6">
//       <h1 className="text-2xl font-medium print:hidden">Stocks Report</h1>

//       {/* filter by business location */}
//       <div className="bg-background rounded-lg shadow-md p-6 space-y-6 print:hidden">
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label>Business Location</Label>
//             </div>
//             <Select
//               onValueChange={handleBusinessLocationChange}
//               value={
//                 skuQuery || searchQuery ? "all" : businessLocation || undefined
//               }
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue
//                   placeholder={
//                     skuQuery || searchQuery
//                       ? "All Locations (Search Active)"
//                       : "Select location"
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 {businessLocationOptions?.map(
//                   (
//                     businessLocation: { label: string; value: string },
//                     index: number
//                   ) => (
//                     <SelectItem key={index} value={businessLocation?.value}>
//                       {businessLocation?.label}
//                     </SelectItem>
//                   )
//                 )}
//               </SelectContent>
//             </Select>
//             {(skuQuery || searchQuery) && (
//               <p className="text-xs text-muted-foreground">
//                 Searches are performed across all locations
//               </p>
//             )}
//           </div> */}

//           <div className="space-y-2">
//             <Label>Business Location</Label>

//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   role="combobox"
//                   className="w-full justify-between"
//                 >
//                   <div className="flex flex-wrap gap-1">
//                     {selectedLocations.length === 0 ? (
//                       <span className="text-muted-foreground">
//                         Select locations...
//                       </span>
//                     ) : selectedLocations.length <= 2 ? (
//                       selectedLocations.map((locationId) => (
//                         <Badge
//                           key={locationId}
//                           variant="secondary"
//                           className="mr-1"
//                         >
//                           {
//                             businessLocationOptions?.find(
//                               (loc) => loc.value === locationId
//                             )?.label
//                           }
//                         </Badge>
//                       ))
//                     ) : (
//                       <span>{selectedLocations.length} locations selected</span>
//                     )}
//                   </div>
//                   <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                 </Button>
//               </PopoverTrigger>

//               <PopoverContent className="w-full p-0" align="start">
//                 <Command>
//                   <CommandInput placeholder="Search locations..." />
//                   <CommandList>
//                     <CommandEmpty>No location found.</CommandEmpty>
//                     <CommandGroup>
//                       {businessLocationOptions?.map((location) => (
//                         <CommandItem
//                           key={location.value}
//                           onSelect={() => {
//                             if (selectedLocations.includes(location.value)) {
//                               const newSelection = selectedLocations.filter(
//                                 (loc) => loc !== location.value
//                               );
//                               setSelectedLocations(newSelection);
//                               handleBusinessLocationChange(
//                                 newSelection.join(",")
//                               );
//                             } else {
//                               const newSelection = [
//                                 ...selectedLocations,
//                                 location.value,
//                               ];
//                               setSelectedLocations(newSelection);
//                               handleBusinessLocationChange(
//                                 newSelection.join(",")
//                               );
//                             }
//                           }}
//                         >
//                           <Checkbox
//                             checked={selectedLocations.includes(location.value)}
//                             className="mr-2"
//                           />
//                           <span>{location.label}</span>
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   </CommandList>
//                 </Command>
//               </PopoverContent>
//             </Popover>

//             {/* Selected locations with remove buttons */}
//             {selectedLocations.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => {
//                     setSelectedLocations([]);
//                     handleBusinessLocationChange("all");
//                   }}
//                   className="h-6 text-xs text-muted-foreground"
//                 >
//                   <X className="h-3 w-3 mr-1" />
//                   Clear All
//                 </Button>

//                 {selectedLocations.map((locationId) => {
//                   const location = businessLocationOptions?.find(
//                     (loc) => loc.value === locationId
//                   );
//                   return (
//                     <Badge
//                       key={locationId}
//                       variant="secondary"
//                       className="flex items-center gap-1"
//                     >
//                       {location?.label}
//                       <X
//                         className="h-3 w-3 cursor-pointer"
//                         onClick={() => {
//                           const newSelection = selectedLocations.filter(
//                             (loc) => loc !== locationId
//                           );
//                           setSelectedLocations(newSelection);
//                           handleBusinessLocationChange(newSelection.join(","));
//                         }}
//                       />
//                     </Badge>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label>SKU</Label>
//             <Input
//               placeholder="Search by sku"
//               onChange={(e) => handleSkuChange(e.target.value)}
//               value={skuQuery}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Search</Label>
//             <Input
//               placeholder="Search by name, barcode, etc."
//               onChange={(e) => handleSearchChange(e.target.value)}
//               value={searchQuery}
//             />
//           </div>

//           {/* === ADD: Sort Field Selection === */}
//           <div className="space-y-2">
//             <Label>Sort By</Label>
//             <Select
//               onValueChange={(value) => {
//                 setSortBy(value);
//                 setPage(1);
//               }}
//               value={sortBy}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select field to sort" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="available_quantity">
//                   Available Quantity
//                 </SelectItem>
//                 <SelectItem value="product.name">Product Name</SelectItem>
//                 <SelectItem value="sku">SKU</SelectItem>
//                 <SelectItem value="sale_price">Sale Price</SelectItem>
//                 <SelectItem value="regular_price">Regular Price</SelectItem>
//                 <SelectItem value="total_sold">Total Sold</SelectItem>
//                 <SelectItem value="createdAt">Created Date</SelectItem>
//                 <SelectItem value="updatedAt">Updated Date</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* === ADD: Sort Order Buttons === */}
//           <div className="space-y-2">
//             <Label>Sort Order</Label>
//             <div className="flex gap-2">
//               <Button
//                 type="button"
//                 variant={sortOrder === "desc" ? "default" : "outline"}
//                 size="sm"
//                 className="flex-1"
//                 onClick={() => {
//                   setSortOrder("desc");
//                   setPage(1);
//                 }}
//               >
//                 Desc
//               </Button>
//               <Button
//                 type="button"
//                 variant={sortOrder === "asc" ? "default" : "outline"}
//                 size="sm"
//                 className="flex-1"
//                 onClick={() => {
//                   setSortOrder("asc");
//                   setPage(1);
//                 }}
//               >
//                 Asc
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* download button */}
//       <div className="w-full flex items-center justify-between">
//         {/* FIXED: Show filtered summary data */}
//         {showSummary ? (
//           <p className="text-sm md:text-base font-medium lg:mr-2">
//             <span className="font-semibold">Total SKU:</span>{" "}
//             {filteredSummary?.total_products ?? 0}
//             <span className="mr-2">,</span>
//             <span className="font-semibold">Available Qty:</span>{" "}
//             {filteredSummary?.total_available_quantity ?? 0}
//             <br />
//             {filteredSummary?.summary_by_category?.length > 0 && (
//               <>
//                 <span className="font-semibold">Category:</span>{" "}
//                 {filteredSummary.summary_by_category
//                   .map(
//                     (c: any) =>
//                       `${c.name} Qty ${c.total_available_quantity} (Sold ${c.total_sold})`
//                   )
//                   .join(", ")}
//               </>
//             )}
//           </p>
//         ) : !shouldSkip ? (
//           <p className="text-sm md:text-base font-medium lg:mr-2">
//             <span className="font-semibold">
//               Total SKU: <span className="text-red-500">N/A</span>
//             </span>{" "}
//             <span className="mr-2">,</span>
//             <span className="font-semibold">
//               Available Qty:<span className="text-red-500">N/A</span>
//             </span>{" "}
//             <br />
//           </p>
//         ) : (
//           <p className="text-sm md:text-base font-medium lg:mr-2 text-muted-foreground">
//             No filters applied
//           </p>
//         )}

//         <div className="flex items-center gap-4">
//           <Button
//             variant="green"
//             size="lg"
//             className="w-fit gap-1"
//             onClick={handleDownloadStockSummaryPDF}
//             disabled={
//               downloadState.stockSummary || !stocks || stocks.length === 0
//             }
//           >
//             {downloadState.stockSummary ? (
//               <>
//                 <Loader className="size-4 animate-spin" />
//                 Downloading...
//               </>
//             ) : (
//               <>
//                 <File className="size-4" />
//                 Stock Summary Download PDF
//               </>
//             )}
//           </Button>

//           <Button
//             variant="outline"
//             size="lg"
//             className="w-fit gap-1"
//             onClick={handleDownloadExcel}
//             disabled={downloadState.excel || !stocks || stocks.length === 0}
//           >
//             {downloadState.excel ? (
//               <>
//                 <Loader className="size-4 animate-spin" />
//                 Downloading...
//               </>
//             ) : (
//               <>
//                 <FileSpreadsheet className="size-4" />
//                 Download Excel
//               </>
//             )}
//           </Button>

//           <Button
//             variant="green"
//             size="lg"
//             className="w-fit gap-1"
//             onClick={handleDownloadPDF}
//             disabled={downloadState.fullPdf || !stocks || stocks.length === 0}
//           >
//             {downloadState.fullPdf ? (
//               <>
//                 <Loader className="size-4 animate-spin" />
//                 Downloading...
//               </>
//             ) : (
//               <>
//                 <File className="size-4" />
//                 Download PDF
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Show empty state when no business location selected and no search */}
//       {shouldSkip ? (
//         <div className="bg-background rounded-lg shadow-md p-8 text-center">
//           <div className="flex flex-col items-center justify-center gap-4">
//             <p className="text-lg font-medium text-muted-foreground">
//               Select a business location or start searching to view stock data
//             </p>
//             <p className="text-sm text-muted-foreground">
//               You can either:
//               <br />
//               1. Select a business location from the dropdown
//               <br />
//               2. Search by SKU (searches across all locations)
//               <br />
//               3. Use the general search (searches across all locations)
//             </p>
//           </div>
//         </div>
//       ) : (
//         <>
//           <StocksReportTable
//             key={`${businessLocation}-${page}-${debouncedSearchQuery}-${debouncedSkuQuery}`}
//             stocks={stocks}
//             isLoading={isLoading || isPageChanging}
//             isFetching={isFetching}
//             isPermissionLoading={isPermissionLoading}
//             hasPermission={hasPermission}
//             businessLocation={
//               businessLocation || (hasSearchTerm ? "all" : null)
//             }
//           />

//           {/* data cards - Only show when we have data */}
//           {showSummary && (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {cards.map((card, index) => {
//                 const Icon = card.icon;
//                 return (
//                   <Card
//                     key={index}
//                     className="hover:shadow-lg transition-shadow duration-200"
//                   >
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium text-muted-foreground">
//                         {card.title}
//                       </CardTitle>
//                       <div className={`p-2 rounded-lg ${card.bgColor}`}>
//                         <Icon className={`h-4 w-4 ${card.color}`} />
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold text-foreground">
//                         {card.value}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}

//           {/* Show loading skeletons when loading */}
//           {(isLoading || isFetching) && (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {Array.from({ length: 4 }).map((_, index) => (
//                 <div
//                   key={index}
//                   className="bg-background p-6 rounded-lg animate-skeleton h-36"
//                 />
//               ))}
//             </div>
//           )}

//           {/* Show message when no data found */}
//           {/* Show message when no data found */}
//           {/* {!isLoading && !isFetching && !showSummary && !shouldSkip && (
//             <div className="bg-background rounded-lg shadow-md p-8 text-center">
//               <p className="text-lg font-medium text-muted-foreground">
//                 {debouncedSkuQuery ? (
//                   <>
//                     No stock data found for SKU:{" "}
//                     <span className="font-semibold">{debouncedSkuQuery}</span>
//                   </>
//                 ) : (
//                   "No stock data found for your search criteria"
//                 )}
//               </p>
//               <p className="text-sm text-muted-foreground mt-2">
//                 {debouncedSkuQuery
//                   ? "Try a different SKU or select a business location"
//                   : "Try adjusting your search terms or select a different business location"}
//               </p>
//             </div>
//           )} */}

//           {/* pagination */}
//           {stocksMeta?.total > 0 && (
//             <div className="print:hidden grid">
//               <div className="bg-background p-2 rounded-lg shadow-md">
//                 <Pagination
//                   limit={limit}
//                   setLimit={setLimit}
//                   currentPage={page}
//                   onPageChange={handlePageChange}
//                   totalItems={stocksMeta?.total}
//                   isShowAllItems={true}
//                 />
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// };

// const StockReportPage = () => {
//   // === check permissions ===
//   const { hasPermission, isPermissionLoading } = useHasPermission({
//     permissions: [PermissionEnum.STOCK_VIEW],
//   });

//   // === loading and persmission error card ===
//   if (!isPermissionLoading && !hasPermission) {
//     return <PermissionErrorCard />;
//   }
//   if (isPermissionLoading) {
//     return <PermissionLoaderCard />;
//   }
//   return (
//     <Suspense fallback={<>Loading...</>}>
//       <StockReportPageComponent />
//     </Suspense>
//   );
// };

// export default StockReportPage;
'use client';

import Pagination from '@/admin/components/shared/pagination';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { Badge } from '@/admin/components/ui/badge';
import { Button } from '@/admin/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/admin/components/ui/card';
import { Checkbox } from '@/admin/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/admin/components/ui/command';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/admin/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import useDebounce from '@/admin/hooks/use-debounce';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import {
    useGetAllStockReportsQuery,
    useGetAllStocksSubcategoryQuery
} from '@/admin/redux/api-queries/stock-api';
import { IBusiness_location } from '@/admin/types/business-location';
import { PermissionEnum } from '@/admin/types/permistion';
import { generateExcel } from '@/admin/utils/excel-generator';
import { generateFullPDF } from '@/admin/utils/pdf-generator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ChevronsUpDown,
    DollarSign,
    File,
    FileSpreadsheet,
    Loader,
    ShoppingCart,
    TrendingUp,
    X
} from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Key, ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { StocksReportTable } from './_components/stocks-report-table';

const StockReportPageComponent = () => {
    // === api query states ===
    const [page, setPage] = useQueryState(
        'page',
        parseAsInteger.withDefault(1)
    );
    const [limit, setLimit] = useState<string | number>(20);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [isPageChanging, setIsPageChanging] = useState(false);

    // === nuqs state for business location ===
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');

    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PURCHASE_VIEW,
            PermissionEnum.POTENTIAL_PROFIT_VIEW
        ]
    });

    // === nuqs state for sale id ===
    const [skuQuery, setSkuQuery] = useQueryState(
        'skuQuery',
        parseAsString.withDefault('')
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        'searchQuery',
        parseAsString.withDefault('')
    );

    // === ADD: Sort states ===
    const [sortBy, setSortBy] = useQueryState(
        'sortBy',
        parseAsString.withDefault('available_quantity')
    );
    const [sortOrder, setSortOrder] = useQueryState(
        'sortOrder',
        parseAsString.withDefault('desc')
    );

    const debouncedSkuQuery = useDebounce(skuQuery);
    const debouncedSearchQuery = useDebounce(searchQuery);

    const [downloadState, setDownloadState] = useState({
        stockSummary: false,
        fullPdf: false,
        excel: false
    });

    // Enhanced cache implementation
    const cachedStockDataRef = useRef<{
        data: any;
        timestamp: number;
        key: string;
    } | null>(null);

    const isDownloadingRef = useRef(false);

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});

    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === MODIFIED: Determine when to skip API call ===
    // Only skip if ALL of these are true:
    // 1. No business location selected (or it's empty string)
    // 2. No SKU search term
    // 3. No general search term
    const hasSearchTerm = debouncedSkuQuery || debouncedSearchQuery;
    const shouldSkip = !businessLocation && !hasSearchTerm;

    // Update API call parameter for multiple locations
    const locationParam = businessLocation
        ? businessLocation === 'all'
            ? undefined
            : businessLocation.split(',') // Split comma-separated string into array
        : undefined;

    //=== Fetch stock reports ===
    const { data, isLoading, isFetching } = useGetAllStockReportsQuery(
        {
            page,
            limit,
            q: debouncedSearchQuery,
            sku: debouncedSkuQuery,
            businessLocationIds: locationParam,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined
        },
        {
            skip: shouldSkip
        }
    );

    //=== Fetch stock subcategories ===
    const { data: ubcategoryData } = useGetAllStocksSubcategoryQuery(
        {
            page,
            limit,
            q: debouncedSearchQuery || debouncedSkuQuery,
            sku: debouncedSkuQuery,
            businessLocationIds: locationParam,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined
        },
        {
            skip: shouldSkip
        }
    );
    const categoryStockData = ubcategoryData?.data?.data;

    // === FIX: Use the existing data instead of making new API calls ===
    const stocks = data?.data?.data;
    const stocksMeta = data?.data?.meta;
    // const stocksReport = data?.data?.summation;
    // GetAllStocksSubcategory  teky total_current_stock_purchase_value dkeaty hoby nahid vai bolcy meet e
    const stocksReport = categoryStockData?.summation;
    // console.log(stocksReport, "stocksReport.........");

    // Calculate manual summary if API doesn't provide filtered summary
    const calculateManualSummary = () => {
        if (!stocks || stocks.length === 0) {
            return {
                total_products: 0,
                total_available_quantity: 0,
                summary_by_category: [],
                total_current_stock_purchase_value: 0,
                total_sale_value: 0,
                total_sold_value: 0
            };
        }

        // Calculate summary from filtered stocks
        const summary_by_category: Record<string, any> = {};
        let total_available_quantity = 0;
        let total_current_stock_purchase_value = 0;
        let total_sale_value = 0;
        let total_sold_value = 0;

        stocks.forEach((stock: any) => {
            const categoryName =
                stock?.product?.category?.name || 'Uncategorized';
            const availableQty = stock?.available_quantity || 0;
            const purchaseValue = stock?.purchase_price || 0;
            const saleValue = stock?.sale_price || 0;
            const soldQty = stock?.total_sold || 0;

            if (!summary_by_category[categoryName]) {
                summary_by_category[categoryName] = {
                    name: categoryName,
                    total_available_quantity: 0,
                    total_sold: 0
                };
            }

            summary_by_category[categoryName].total_available_quantity +=
                availableQty;
            summary_by_category[categoryName].total_sold += soldQty;

            total_available_quantity += availableQty;
            total_current_stock_purchase_value += availableQty * purchaseValue;
            total_sale_value += availableQty * saleValue;
            total_sold_value += soldQty * saleValue;
        });

        return {
            total_products: stocks.length,
            total_available_quantity,
            summary_by_category: Object.values(summary_by_category),
            total_current_stock_purchase_value,
            total_sale_value,
            total_sold_value
        };
    };

    // Use API summary if available, otherwise calculate manually
    const filteredSummary = stocksReport || calculateManualSummary();

    // Custom business location handler that updates both query state and UI state
    const handleBusinessLocationChange = (value: string) => {
        setBusinessLocation(value);
        setPage(1);

        // Update selectedLocations state for UI
        if (value === 'all') {
            setSelectedLocations([]);
        } else if (value.includes(',')) {
            setSelectedLocations(value.split(','));
        } else if (value) {
            setSelectedLocations([value]);
        } else {
            setSelectedLocations([]);
        }
    };

    // Initialize selectedLocations from businessLocation query state
    useEffect(() => {
        if (businessLocation) {
            if (businessLocation === 'all') {
                setSelectedLocations([]);
            } else if (businessLocation.includes(',')) {
                setSelectedLocations(businessLocation.split(','));
            } else {
                setSelectedLocations([businessLocation]);
            }
        }
    }, [businessLocation]);

    // Handle location selection in multi-select
    const handleLocationSelect = (locationId?: string | null) => {
        if (!locationId) return;
        let newSelectedLocations: string[];

        if (selectedLocations.includes(locationId)) {
            // Remove from selection
            newSelectedLocations = selectedLocations.filter(
                (loc) => loc !== locationId
            );
        } else {
            // Add to selection
            newSelectedLocations = [...selectedLocations, locationId];
        }

        setSelectedLocations(newSelectedLocations);

        // Update query state
        if (newSelectedLocations.length === 0) {
            handleBusinessLocationChange('all');
        } else {
            handleBusinessLocationChange(newSelectedLocations.join(','));
        }
    };

    // Handle select all locations
    interface LocationOption {
        value: string; // or number, depending on your data
        label: string;
        // add other properties if they exist
    }

    const handleSelectAll = () => {
        const allLocationIds =
            businessLocationOptions?.map((loc: LocationOption) => loc.value) ||
            [];
        setSelectedLocations(allLocationIds);
        handleBusinessLocationChange(allLocationIds.join(','));
    };

    // Handle clear all locations
    const handleClearAll = () => {
        setSelectedLocations([]);
        handleBusinessLocationChange('all');
    };

    // MODIFIED: Handle search inputs
    const handleSkuChange = (value: string) => {
        setSkuQuery(value);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handlePageChange = (newPage: number) => {
        setIsPageChanging(true);
        setPage(newPage);
        setTimeout(() => setIsPageChanging(false), 500);
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchQuery, debouncedSkuQuery, businessLocation, setPage]);

    // Generate cache key based on current filters
    const generateCacheKey = () => {
        return `${businessLocation}-${debouncedSearchQuery}-${debouncedSkuQuery}-${sortBy}-${sortOrder}`;
    };

    // === FIX: Use existing data for downloads instead of making new API calls ===
    const getStocksDataForDownload = () => {
        const cacheKey = generateCacheKey();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        // Check cache first
        if (
            cachedStockDataRef.current &&
            cachedStockDataRef.current.key === cacheKey &&
            Date.now() - cachedStockDataRef.current.timestamp < CACHE_DURATION
        ) {
            return cachedStockDataRef.current.data;
        }

        // Use the current data from the main query
        const currentData = {
            data: stocks,
            summation: filteredSummary,
            meta: stocksMeta
        };

        // Update cache with current data
        cachedStockDataRef.current = {
            data: currentData,
            timestamp: Date.now(),
            key: cacheKey
        };

        return currentData;
    };

    // Clear cache when filters change
    useEffect(() => {
        cachedStockDataRef.current = null;
    }, [
        businessLocation,
        debouncedSearchQuery,
        debouncedSkuQuery,
        sortBy,
        sortOrder
    ]);

    const handleDownload = async (type: 'pdf' | 'summary' | 'excel') => {
        if (isDownloadingRef.current) {
            return;
        }

        isDownloadingRef.current = true;
        const downloadKey =
            type === 'pdf'
                ? 'fullPdf'
                : type === 'summary'
                  ? 'stockSummary'
                  : 'excel';

        setDownloadState((prev) => ({
            ...prev,
            [downloadKey]: true
        }));

        try {
            let data;
            if (type === 'summary') {
                data = ubcategoryData;
            } else {
                data = getStocksDataForDownload();
            }

            if (!data) {
                return;
            }

            if (
                (type === 'pdf' || type === 'excel') &&
                (!data.data || data.data.length === 0)
            ) {
                alert('No stock data available to download');
                return;
            }

            if (type === 'pdf') {
                await generateFullPDF(
                    data,
                    businessLocationData,
                    businessLocation || 'all'
                );
            } else if (type === 'summary') {
                await generateSummaryPDF(data);
            } else if (type === 'excel') {
                await generateExcel(
                    data,
                    businessLocationData,
                    businessLocation || 'all'
                );
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Error downloading file');
        } finally {
            isDownloadingRef.current = false;
            setDownloadState((prev) => ({
                ...prev,
                [downloadKey]: false
            }));
        }
    };

    const generateSummaryPDF = async (ubcategoryData: any) => {
        const allStocks = ubcategoryData?.data?.data || [];
        const stocksSummarySubCategory =
            categoryStockData?.summation?.summary_by_subcategory || [];
        const stocksReportInside = categoryStockData?.summation || {};

        if (!allStocks.length && stocksSummarySubCategory.length === 0) {
            console.warn('No data available for download');
            return;
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header
        doc.setFontSize(16);
        doc.text('Griipbuddy', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(13);
        doc.text('Stock Summary Reports', pageWidth / 2, 25, {
            align: 'center'
        });

        let y = 40;

        // Show selected locations in PDF
        if (selectedLocations.length > 0) {
            const selectedLocationNames = selectedLocations
                .map(
                    (locationId) =>
                        businessLocationOptions?.find(
                            (loc: { value: string }) => loc.value === locationId
                        )?.label || locationId
                )
                .join(', ');

            doc.setFontSize(11);
            doc.text(`Business Location: ${selectedLocationNames}`, 14, y);
            y += 8;
        } else if (businessLocation === 'all' || hasSearchTerm) {
            doc.setFontSize(11);
            doc.text(`Business Location: All Locations`, 14, y);
            y += 8;
        }

        // Add search filter info
        if (skuQuery) {
            doc.setFontSize(11);
            doc.text(`SKU Filter: ${skuQuery}`, 14, y);
            y += 8;
        }
        if (searchQuery) {
            doc.setFontSize(11);
            doc.text(`Search Filter: ${searchQuery}`, 14, y);
            y += 8;
        }

        const today = new Date().toLocaleString();
        doc.text(`Date: ${today}`, 14, y);
        y += 8;

        // Summary section
        if (stocksReportInside) {
            const totalLine = `Total Qty: ${(
                stocksReportInside?.summary_by_category ?? []
            )
                .map(
                    (c: any) => `${c.name} (${c.total_available_quantity} Qty)`
                )
                .join(', ')}`;
            doc.setFont('helvetica', 'normal');

            const splitText = doc.splitTextToSize(totalLine, pageWidth - 28);
            doc.text(splitText, 14, y);
            y += 6 * splitText.length;
        }

        // Table
        const tableBody = stocksSummarySubCategory.map((inventory: any) => {
            const nameWithVariant = `${inventory?.name ?? ''}`;
            const availableQty =
                Number(inventory?.total_available_quantity) || 0;
            const totalPurchaseValue =
                Number(inventory?.total_current_stock_purchase_value) || 0;
            const totalSaleValue = Number(inventory?.total_sale_value) || 0;

            return [
                nameWithVariant,
                `${availableQty} Pair/pcs`,
                `${Number(totalPurchaseValue).toLocaleString()} Tk`,
                `${Number(totalSaleValue).toLocaleString()} Tk`
            ];
        });

        autoTable(doc, {
            startY: y + 5,
            head: [
                [
                    'Sub Category',
                    'Available Quantity',
                    'Purchase Value',
                    'Total Sale Value'
                ]
            ],
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
            tableWidth: pageWidth - 28,
            columnStyles: {
                0: { cellWidth: (pageWidth - 28) * 0.4 },
                1: { cellWidth: (pageWidth - 28) * 0.2 },
                2: { cellWidth: (pageWidth - 28) * 0.2 },
                3: { cellWidth: (pageWidth - 28) * 0.2 }
            },
            pageBreak: 'auto',
            didDrawPage: function (data: any) {
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

        let currentY = (doc as any).lastAutoTable.finalY + 15;

        // Check if we need new page for summary
        if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = 20;
        }

        // Summary block
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

        // Signature Section
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

        doc.save(
            `stocks_summary_report_${new Date().toLocaleDateString()}.pdf`
        );
    };

    const handleDownloadPDF = () => handleDownload('pdf');
    const handleDownloadStockSummaryPDF = () => handleDownload('summary');
    const handleDownloadExcel = () => handleDownload('excel');

    // Dynamic cards that update based on filtered data
    const cards = [
        {
            title: 'Current Stock Value (by purchase rate)',
            value: `${Number(
                Math.floor(
                    filteredSummary.total_current_stock_purchase_value
                ) || 0
            ).toLocaleString()} TK`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20'
        },
        {
            title: 'Potential Sale Value (by sale price)',
            value: `${Number(
                Math.floor(filteredSummary.total_sale_value) || 0
            ).toLocaleString()} Tk`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20'
        },
        {
            title: 'Potential Profit Value (by sale price)',
            value: `${Number(
                Math.floor(filteredSummary.total_sale_value) -
                    Math.floor(
                        filteredSummary.total_current_stock_purchase_value
                    ) || 0
            ).toLocaleString()} Tk`,
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
        },
        {
            title: 'Total Sold Value (sell)',
            value: `${Number(
                Math.floor(filteredSummary.total_sold_value) || 0
            ).toLocaleString()} Tk`,
            icon: ShoppingCart,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20'
        }
    ];

    // Check if we have data from API
    const hasData = stocks && stocks.length > 0;
    const showSummary = hasData;

    return (
        <section className='flex flex-col gap-6'>
            <h1 className='text-2xl font-medium print:hidden'>Stocks Report</h1>

            {/* filter by business location */}
            <div className='space-y-6 rounded-lg bg-background p-6 shadow-md print:hidden'>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Multi-select Business Location */}
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <Label>Business Location</Label>
                            {selectedLocations.length > 0 && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleClearAll}
                                    className='h-6 text-xs text-muted-foreground'
                                >
                                    <X className='mr-1 h-3 w-3' />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    className='h-10 w-full justify-between'
                                >
                                    <div className='flex flex-wrap gap-1 overflow-hidden'>
                                        {selectedLocations.length === 0 ? (
                                            <span className='text-muted-foreground'>
                                                Select locations...
                                            </span>
                                        ) : selectedLocations.length <= 2 ? (
                                            selectedLocations.map(
                                                (locationId) => (
                                                    <Badge
                                                        key={locationId}
                                                        variant='secondary'
                                                        className='mr-1'
                                                    >
                                                        {
                                                            businessLocationOptions?.find(
                                                                (loc: {
                                                                    value: string;
                                                                }) =>
                                                                    loc.value ===
                                                                    locationId
                                                            )?.label
                                                        }
                                                    </Badge>
                                                )
                                            )
                                        ) : (
                                            <span>
                                                {selectedLocations.length}{' '}
                                                locations selected
                                            </span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className='w-full p-0'
                                align='start'
                            >
                                <Command>
                                    <CommandInput placeholder='Search locations...' />
                                    <CommandList className='max-h-[300px]'>
                                        <CommandEmpty>
                                            No location found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {/* Select All option */}
                                            <CommandItem
                                                onSelect={handleSelectAll}
                                                className='flex items-center space-x-2'
                                            >
                                                <Checkbox
                                                    checked={
                                                        selectedLocations.length ===
                                                        businessLocationOptions?.length
                                                    }
                                                />
                                                <span>Select All</span>
                                            </CommandItem>

                                            {/* All Locations option */}
                                            <CommandItem
                                                onSelect={handleClearAll}
                                                className='flex items-center space-x-2'
                                            >
                                                <Checkbox
                                                    checked={
                                                        selectedLocations.length ===
                                                        0
                                                    }
                                                />
                                                <span>All Locations</span>
                                            </CommandItem>

                                            <div className='my-1 h-px bg-border' />

                                            {/* Location options */}
                                            {businessLocationOptions?.map(
                                                (location: {
                                                    value:
                                                        Key | null | undefined;
                                                    label: ReactNode;
                                                }) => (
                                                    <CommandItem
                                                        key={location.value}
                                                        onSelect={() => {
                                                            if (
                                                                location.value !==
                                                                    null &&
                                                                location.value !==
                                                                    undefined
                                                            ) {
                                                                handleLocationSelect(
                                                                    location.value.toString()
                                                                );
                                                            }
                                                        }}
                                                        className='flex items-center space-x-2'
                                                    >
                                                        <Checkbox
                                                            checked={selectedLocations.includes(
                                                                location.value?.toString() ??
                                                                    ''
                                                            )}
                                                        />
                                                        <span>
                                                            {location.label}
                                                        </span>
                                                    </CommandItem>
                                                )
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected locations with remove buttons */}
                        {selectedLocations.length > 0 && (
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {selectedLocations.map((locationId) => {
                                    const location =
                                        businessLocationOptions?.find(
                                            (loc: { value: string }) =>
                                                loc.value === locationId
                                        );
                                    return (
                                        <Badge
                                            key={locationId}
                                            variant='secondary'
                                            className='flex items-center gap-1'
                                        >
                                            {location?.label}
                                            <X
                                                className='h-3 w-3 cursor-pointer'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLocationSelect(
                                                        locationId
                                                    );
                                                }}
                                            />
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label>SKU</Label>
                        <Input
                            placeholder='Search by sku'
                            onChange={(e) => handleSkuChange(e.target.value)}
                            value={skuQuery}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Search</Label>
                        <Input
                            placeholder='Search by name, barcode, etc.'
                            onChange={(e) => handleSearchChange(e.target.value)}
                            value={searchQuery}
                        />
                    </div>

                    {/* Sort Field Selection */}
                    <div className='space-y-2'>
                        <Label>Sort By</Label>
                        <Select
                            onValueChange={(value) => {
                                setSortBy(value);
                                setPage(1);
                            }}
                            value={sortBy}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select field to sort' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='available_quantity'>
                                    Available Quantity
                                </SelectItem>
                                <SelectItem value='product.name'>
                                    Product Name
                                </SelectItem>
                                <SelectItem value='sku'>SKU</SelectItem>
                                <SelectItem value='sale_price'>
                                    Sale Price
                                </SelectItem>
                                <SelectItem value='regular_price'>
                                    Regular Price
                                </SelectItem>
                                <SelectItem value='total_sold'>
                                    Total Sold
                                </SelectItem>
                                <SelectItem value='createdAt'>
                                    Created Date
                                </SelectItem>
                                <SelectItem value='updatedAt'>
                                    Updated Date
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Order Buttons */}
                    <div className='space-y-2'>
                        <Label>Sort Order</Label>
                        <div className='flex gap-2'>
                            <Button
                                type='button'
                                variant={
                                    sortOrder === 'desc' ? 'default' : 'outline'
                                }
                                size='sm'
                                className='flex-1'
                                onClick={() => {
                                    setSortOrder('desc');
                                    setPage(1);
                                }}
                            >
                                Desc
                            </Button>
                            <Button
                                type='button'
                                variant={
                                    sortOrder === 'asc' ? 'default' : 'outline'
                                }
                                size='sm'
                                className='flex-1'
                                onClick={() => {
                                    setSortOrder('asc');
                                    setPage(1);
                                }}
                            >
                                Asc
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* download button and summary */}
            <div className='flex w-full items-center justify-between'>
                {/* Summary Display */}
                {showSummary ? (
                    <div className='text-sm font-medium md:text-base lg:mr-2'>
                        <div>
                            <span className='font-semibold'>Total SKU:</span>{' '}
                            {filteredSummary?.total_products ?? 0}
                            <span className='mr-2'>,</span>
                            <span className='font-semibold'>
                                Available Qty:
                            </span>{' '}
                            {filteredSummary?.total_available_quantity ?? 0}
                        </div>
                        {filteredSummary?.summary_by_category?.length > 0 && (
                            <div className='mt-1'>
                                <span className='font-semibold'>Category:</span>{' '}
                                {filteredSummary.summary_by_category
                                    .map(
                                        (c: any) =>
                                            `${c.name} Qty ${c.total_available_quantity} (Sold ${c.total_sold})`
                                    )
                                    .join(', ')}
                            </div>
                        )}
                        {/* Show selected locations in summary */}
                        {selectedLocations.length > 0 && (
                            <div className='mt-1'>
                                <span className='font-semibold'>
                                    Selected Locations:
                                </span>{' '}
                                {selectedLocations
                                    .map(
                                        (locationId) =>
                                            businessLocationOptions?.find(
                                                (loc: { value: string }) =>
                                                    loc.value === locationId
                                            )?.label
                                    )
                                    .filter(Boolean)
                                    .join(', ')}
                            </div>
                        )}
                    </div>
                ) : !shouldSkip ? (
                    <p className='text-sm font-medium md:text-base lg:mr-2'>
                        <span className='font-semibold'>
                            Total SKU: <span className='text-red-500'>N/A</span>
                        </span>{' '}
                        <span className='mr-2'>,</span>
                        <span className='font-semibold'>
                            Available Qty:{' '}
                            <span className='text-red-500'>N/A</span>
                        </span>
                    </p>
                ) : (
                    <p className='text-sm font-medium text-muted-foreground md:text-base lg:mr-2'>
                        No filters applied
                    </p>
                )}

                <div className='flex items-center gap-4'>
                    <Button
                        variant='green'
                        size='lg'
                        className='w-fit gap-1'
                        onClick={handleDownloadStockSummaryPDF}
                        disabled={
                            downloadState.stockSummary ||
                            !stocks ||
                            stocks.length === 0
                        }
                    >
                        {downloadState.stockSummary ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <File className='size-4' />
                                Stock Summary PDF
                            </>
                        )}
                    </Button>

                    <Button
                        variant='outline'
                        size='lg'
                        className='w-fit gap-1'
                        onClick={handleDownloadExcel}
                        disabled={
                            downloadState.excel ||
                            !stocks ||
                            stocks.length === 0
                        }
                    >
                        {downloadState.excel ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Downloading...
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
                        size='lg'
                        className='w-fit gap-1'
                        onClick={handleDownloadPDF}
                        disabled={
                            downloadState.fullPdf ||
                            !stocks ||
                            stocks.length === 0
                        }
                    >
                        {downloadState.fullPdf ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <File className='size-4' />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Show empty state when no filters applied */}
            {shouldSkip ? (
                <div className='rounded-lg bg-background p-8 text-center shadow-md'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <p className='text-lg font-medium text-muted-foreground'>
                            Select business locations or start searching to view
                            stock data
                        </p>
                        <p className='text-sm text-muted-foreground'>
                            You can either:
                            <br />
                            1. Select one or more business locations
                            <br />
                            2. Search by SKU (searches across all locations)
                            <br />
                            3. Use the general search (searches across all
                            locations)
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <StocksReportTable
                        key={`${businessLocation}-${page}-${debouncedSearchQuery}-${debouncedSkuQuery}`}
                        stocks={stocks}
                        isLoading={isLoading || isPageChanging}
                        isFetching={isFetching}
                        isPermissionLoading={isPermissionLoading}
                        hasPermission={hasPermission}
                        businessLocation={
                            businessLocation || (hasSearchTerm ? 'all' : null)
                        }
                    />

                    {/* Data cards - Only show when we have data */}
                    {showSummary && (
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {cards.map((card, index) => {
                                const Icon = card.icon;
                                return (
                                    <Card
                                        key={index}
                                        className='transition-shadow duration-200 hover:shadow-lg'
                                    >
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                            <CardTitle className='text-sm font-medium text-muted-foreground'>
                                                {card.title}
                                            </CardTitle>
                                            <div
                                                className={`rounded-lg p-2 ${card.bgColor}`}
                                            >
                                                <Icon
                                                    className={`h-4 w-4 ${card.color}`}
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='text-2xl font-bold text-foreground'>
                                                {card.value}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Show loading skeletons when loading */}
                    {(isLoading || isFetching) && (
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='animate-skeleton h-36 rounded-lg bg-background p-6'
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {stocksMeta?.total > 0 && (
                        <div className='grid print:hidden'>
                            <div className='rounded-lg bg-background p-2 shadow-md'>
                                <Pagination
                                    limit={limit}
                                    setLimit={setLimit}
                                    currentPage={page}
                                    onPageChange={handlePageChange}
                                    totalItems={stocksMeta?.total}
                                    isShowAllItems={true}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

const StockReportPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.STOCK_VIEW]
    });

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }
    return (
        <Suspense fallback={<>Loading...</>}>
            <StockReportPageComponent />
        </Suspense>
    );
};

export default StockReportPage;
