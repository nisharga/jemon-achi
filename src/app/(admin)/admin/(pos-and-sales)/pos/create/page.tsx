'use client';
import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
    Suspense
} from 'react';
import {
    PosSaleRequest,
    DiscountCalculationType,
    PaymentMethod,
    CartItemUI,
    CartItemPatch
} from '@/types/admin/pos';
import { CustomerSelector } from './_components/CustomerSelector';
import { ProductSelector } from './_components/ProductSelector';
import { DiscountControl } from './_components/DiscountControl';
import { PaymentDetails } from './_components/PaymentDetails';
import { NotesSection } from './_components/NotesSection';
import { CartTable } from './_components/CartTable';
import useDebounce from '@/hooks/use-debounce';
import useBarcodeScanner from '@/hooks/useBarcodeScanner';
import { mapScanToVariantItem } from '@/utils/posMappers';
import { toast } from 'sonner';
import { Button } from '@/components/ui/admin-button';
import { Loader, Printer } from 'lucide-react';
import PrintableSaleInvoice from './_components/printable-sale-invoice';
import {
    useGetAllInventoriesForBusinessLocationQuery,
    useLazyGetScanInventoryQuery
} from '@/redux/admin/api/inventory-api';
import { useCreateSaleMutation } from '@/redux/admin/api/pos-sale-api';
import { useQueryState } from 'nuqs';
import { useGetAllBusinessLocationsQuery } from '@/redux/admin/api/business-location-api';
import { IBusiness_location } from '@/types/admin/business-location';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/admin-label';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { DatePicker } from '@/components/ui/date-picker';

type TSaveAction = 'SAVE_AND_PRINT' | 'SAVE';

const CreatePosSalePageCom = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.POS_CREATE]
    });

    // === nuqs state for business location ===
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // product search/scan/debounce
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm);

    // === state for PrintableSaleInvoice ===
    const [saleId, setSaleId] = useState('');

    const [createSale, { isLoading: isSaving }] = useCreateSaleMutation();

    // === get all Inventory ===
    const { data, isLoading } = useGetAllInventoriesForBusinessLocationQuery({
        page: 1,
        limit: 20,
        business_location_id: businessLocation,
        searchQuery: debouncedSearchTerm
    });
    const inventories = data?.data?.data;
    // console.log("inventories: ", inventories);

    //  === Search a product by barcode scan via API ===
    const [triggerScan, { isFetching: isScanning }] =
        useLazyGetScanInventoryQuery();

    // 1. Default to Walk-In Customer
    const [selectedCustomer, setSelectedCustomer] = useState({
        phone: '',
        name: ''
    });

    // 3. Default date/time = now
    const [saleDate, setSaleDate] = useState(new Date().toISOString());
    console.log({ saleDate });
    // cart & discounts
    const [cart, setCart] = useState<CartItemUI[]>([]);
    const [discountType, setDiscountType] = useState<DiscountCalculationType>(
        DiscountCalculationType.FLAT
    );
    const [discountValue, setDiscountValue] = useState<number | null>(null);

    // payment Method
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
        PaymentMethod.Cash
    );
    const [paymentAccount, setPaymentAccount] = useState('');
    const [paidAmount, setPaidAmount] = useState<number | null>(null);

    // notes
    const [saleNote, setSaleNote] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    // Add/merge variant into cart
    const handleAddVariant = useCallback((item: any) => {
        // === if stcok not available then return func and show error ===
        const stock = item?.variant?.availableQuantity;
        if (stock === 0) {
            toast.error('Stock not available!');
            return;
        }

        const variant = item.variant;
        setCart((prev) => {
            const exists = prev.find(
                (it) =>
                    it.product === item.productId &&
                    it.selected_variant.sku === variant.sku
            );
            if (exists) {
                return prev.map((it) =>
                    it.product === item.productId &&
                    it.selected_variant.sku === variant.sku
                        ? { ...it, quantity: it.quantity + 1 }
                        : it
                );
            }
            return [
                ...prev,
                {
                    product: item.productId,
                    quantity: 1,
                    product_discount: {
                        type: DiscountCalculationType.FLAT,
                        value: null
                    },
                    selected_variant: variant,

                    // UI‐only metadata
                    productName: item.productName,
                    thumbnail: item.thumbnail
                }
            ];
        });
        setSearchTerm('');
    }, []);

    // === NEW: barcode scan via API ===
    const handleScanBarcode = useCallback(
        async (barcode: string) => {
            const code = barcode.trim();
            if (!code) return;

            try {
                const resp = await triggerScan({
                    barcode: code,
                    business_location_id: businessLocation
                }).unwrap();

                if (!resp?.success) {
                    toast.error(
                        resp?.message || 'No product found for this barcode.'
                    );
                    return;
                }

                const item = mapScanToVariantItem(resp);

                // Optional: warn on zero/negative stock
                if (
                    typeof item.variant?.available_quantity === 'number' &&
                    item.variant.available_quantity <= 0
                ) {
                    toast.warning(
                        `Stock not available for ${item.productName} (${item.variant.sku}).`
                    );
                }

                handleAddVariant(item);
                toast.success(
                    `Added: ${item.productName} (${item.variant.sku})`
                );
            } catch (e) {
                console.log(e);
                toast.error('Failed to scan product. Please try again.');
            } finally {
                setSearchTerm('');
            }
        },
        [triggerScan, businessLocation, handleAddVariant]
    );

    // === NEW: auto-capture hardware scanner (global) ===
    useBarcodeScanner(handleScanBarcode, {
        charThresholdMs: 35, // 35ms between chars
        burstEndMs: 200, // 200ms idle ends burst
        minLength: 10, // Minimum length for a valid scan
        ignoreWhenFocusingEditable: true // Ignore if typing in inputs
    });

    // update a cart item (qty or discount)
    const handleItemChange = (index: number, changes: CartItemPatch) => {
        setCart((prev) =>
            prev.map((it, i) => {
                if (i !== index) return it;
                return {
                    ...it,
                    ...(changes.quantity !== undefined
                        ? { quantity: changes.quantity }
                        : {}),
                    product_discount: changes.product_discount
                        ? {
                              ...it.product_discount,
                              ...changes.product_discount
                          }
                        : it.product_discount
                };
            })
        );
    };

    const handleRemoveItem = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    // totals (no VAT)
    const totals = useMemo(() => {
        let subtotal = 0,
            itemDiscounts = 0;
        cart.forEach((item) => {
            const line = item?.selected_variant?.regular_price * item?.quantity;
            subtotal += line;

            const lineDiscVal = item?.product_discount?.value ?? 0; // null -> 0
            const disc =
                item?.product_discount?.type ===
                DiscountCalculationType.PERCENTAGE
                    ? (line * lineDiscVal) / 100
                    : lineDiscVal;
            itemDiscounts += disc;
        });
        const afterItem = subtotal - itemDiscounts;

        const globalDiscValue = discountValue ?? 0; //empty discountValue treat as 0
        const globalDisc =
            discountType === DiscountCalculationType.PERCENTAGE
                ? (afterItem * globalDiscValue) / 100
                : globalDiscValue;

        const grandTotal = afterItem - globalDisc;
        const paid = paidAmount ?? 0; // empty paidAmount treat as 0
        const due = grandTotal - paid;
        const change = paid > grandTotal ? paid - grandTotal : 0;

        return { subtotal, itemDiscounts, globalDisc, grandTotal, due, change };
    }, [cart, discountType, discountValue, paidAmount]);

    // save via RTK Query
    const handleSave = async (event: TSaveAction) => {
        const payload: PosSaleRequest = {
            customer_phone: selectedCustomer.phone,
            customer_name: selectedCustomer.name,
            business_location: businessLocation as string,
            sale_date: new Date(saleDate).toISOString(),
            // products: cart,
            overall_discount: { type: discountType, value: discountValue ?? 0 },
            paid_amount: paidAmount ?? 0,
            payment_method: paymentMethod,
            payment_account: paymentAccount,
            sale_note: saleNote,
            payment_note: paymentNote,
            products: cart.map(
                ({
                    product,
                    quantity,
                    product_discount,
                    selected_variant
                }) => ({
                    product,
                    quantity,
                    product_discount: {
                        ...product_discount,
                        value: product_discount.value ?? 0 // null -> 0 for API
                    },
                    selected_variant
                })
            )
        };

        try {
            if (event === 'SAVE_AND_PRINT') {
                const res: any = await createSale(payload);
                if (res?.data?.success) {
                    // set sale for printable invoice
                    setSaleId(res?.data?.data?._id);

                    // show success message
                    toast.success(
                        'Sale created successfully! Print window opening...',
                        {
                            duration: 1000
                        }
                    );

                    // clear form and cart
                    handleClear();

                    // open print window
                    setTimeout(() => {
                        window.print();
                    }, 3000);
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message || 'Failed to create sale!'
                    );
                }
            } else {
                const res: any = await createSale(payload);
                if (res?.data?.success) {
                    // show success message
                    toast.success('Sale created successfully!');

                    // clear form and cart
                    handleClear();
                } else if (res?.error?.data?.message) {
                    toast.error(
                        res?.error?.data?.message || 'Failed to create sale!'
                    );
                }
            }
        } catch (err: any) {
            const msg =
                err?.data?.message ??
                err?.data?.errorMessages?.[0]?.message ??
                err?.error ??
                'Failed to create sale';
            toast.error(msg);
        }
    };

    // set paid amount to grand total if it is greater than 0
    useEffect(() => {
        if (totals.grandTotal > 0) {
            setPaidAmount(totals.grandTotal);
        }
    }, [totals.grandTotal]);

    useEffect(() => {
        if (cart.length === 0) {
            setPaidAmount(null);
        }
    }, [cart.length]);

    const handleClear = () => {
        // Clear Customer
        setSelectedCustomer({ phone: '', name: '' });

        // Clear Cart
        setCart([]);

        // Clear Discount
        setDiscountType(DiscountCalculationType.FLAT);
        setDiscountValue(null);

        // Clear Payment
        setPaymentMethod(PaymentMethod.Cash);
        setPaymentAccount('');
        setPaidAmount(null);

        // Clear Notes
        setSaleNote('');
        setPaymentNote('');
    };

    // === clear sale id after close the print window ===
    useEffect(() => {
        const handleAfterPrint = () => {
            setSaleId('');
        };

        window.addEventListener('afterprint', handleAfterPrint);

        // clean up
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <>
            <main className='grid min-h-full grid-cols-1 gap-6 bg-gray-100 lg:grid-cols-4 print:hidden'>
                <div className='flex flex-col gap-5 rounded-lg bg-white p-4 shadow-sm lg:col-span-3'>
                    {!businessLocation && (
                        <div className='flex h-9 w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 text-center text-sm font-medium text-destructive'>
                            Please select business location first!
                        </div>
                    )}

                    <div className='space-y-2'>
                        <Label>Select Business Location</Label>
                        <Select
                            onValueChange={(value) => {
                                setBusinessLocation(value);
                            }}
                            value={businessLocation as string}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select business location' />
                            </SelectTrigger>

                            <SelectContent>
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
                                            value={businessLocation?.value}
                                        >
                                            {businessLocation?.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        {/* Select Customer */}
                        <CustomerSelector
                            selectedCustomer={selectedCustomer}
                            onSelect={setSelectedCustomer}
                            onAddNew={(phone, name) =>
                                setSelectedCustomer({ phone, name })
                            }
                            businessLocation={businessLocation as string}
                        />

                        <DatePicker
                            value={saleDate}
                            onChange={setSaleDate}
                            label='Sale Date'
                        />
                        {/* <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 h-9 md:text-sm text-left font-normal",
                      !saleDate && "text-muted-foreground"
                    )}
                  >
                    {saleDate ? (
                      format(saleDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    required={true}
                    selected={saleDate}
                    onSelect={setSaleDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div> */}
                    </div>

                    <ProductSelector
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        results={inventories}
                        isLoading={isLoading || isScanning} // show spinner if scanning too
                        onAddVariant={handleAddVariant}
                        onScanBarcode={handleScanBarcode} // ⬅️ now uses scan API
                        businessLocation={businessLocation as string}
                    />

                    <CartTable
                        cart={cart}
                        onItemChange={handleItemChange}
                        onRemove={handleRemoveItem}
                    />

                    {/* print invoice button */}
                    <div className='mx-auto mt-auto flex w-fit items-center gap-6 print:hidden'>
                        <Button
                            onClick={() => handleSave('SAVE')}
                            size='xl'
                            variant='primary'
                            disabled={
                                cart?.length === 0 || isSaving || isScanning
                            }
                        >
                            Save
                            {isSaving && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>

                        <Button
                            onClick={() => handleSave('SAVE_AND_PRINT')}
                            size='xl'
                            variant='green'
                            disabled={
                                cart?.length === 0 || isSaving || isScanning
                            }
                        >
                            Save & Print {!isSaving && <Printer />}
                            {isSaving && (
                                <Loader
                                    size={16}
                                    className='ml-2 animate-spin'
                                />
                            )}
                        </Button>
                        {/* <Button onClick={() => window.print()} size='xl' variant='green'>
       Open
      </Button> */}
                    </div>
                </div>

                <div className='flex flex-col gap-5 rounded-lg bg-white p-4 text-gray-600 shadow-sm'>
                    {/* Totals */}
                    <div className='space-y-2 rounded-lg bg-white p-4 text-base text-gray-600 shadow-sm'>
                        <div className='flex justify-between'>
                            <span>Subtotal</span>
                            <span>{totals.subtotal}</span>
                        </div>
                        <div className='flex justify-between text-green-600'>
                            <span>Item Discounts</span>
                            <span>-{totals.itemDiscounts}</span>
                        </div>
                        <div className='flex justify-between text-green-600'>
                            <span>Global Discount</span>
                            <span>-{totals.globalDisc}</span>
                        </div>
                        <hr />
                        <div className='flex justify-between text-base font-bold'>
                            <span>Grand Total</span>
                            <span>{totals.grandTotal}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span>{totals.change > 0 ? 'Change' : 'Due'}</span>
                            <span>
                                {totals.change > 0 ? totals.change : totals.due}
                            </span>
                        </div>
                    </div>

                    <DiscountControl
                        discountType={discountType}
                        discountValue={discountValue}
                        onTypeChange={setDiscountType}
                        onValueChange={setDiscountValue}
                    />

                    <PaymentDetails
                        method={paymentMethod as PaymentMethod}
                        onMethodChange={setPaymentMethod}
                        account={paymentAccount}
                        onAccountChange={setPaymentAccount}
                        paidAmount={paidAmount}
                        onPaidChange={setPaidAmount}
                    />

                    <NotesSection
                        saleNote={saleNote}
                        paymentNote={paymentNote}
                        onSaleNoteChange={setSaleNote}
                        onPaymentNoteChange={setPaymentNote}
                    />

                    {/* <ActionButtons
          onSave={handleSave}
          isLoading={isSaving}
          onSavePrint={handleSavePrint}
          isDisabled={cart?.length === 0 || isSaving || isScanning}
        /> */}
                </div>
            </main>

            {/* printable section */}
            {saleId && <PrintableSaleInvoice saleId={saleId!} />}
            {/* <PrintableSaleInvoice saleId={saleId!}/> */}
        </>
    );
};

const CreatePosSalePage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <CreatePosSalePageCom />
        </Suspense>
    );
};

export default CreatePosSalePage;
