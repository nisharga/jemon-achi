/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { Info, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/public/ui/card';
import { Input } from '@/components/public/ui/input';
import { Textarea } from '@/components/public/ui/textarea';
import { Label } from '@/components/public/ui/label';
import { Skeleton } from '@/components/public/ui/skeleton';
import { motion } from 'framer-motion';

import { useAppDispatch, useAppSelector } from '@/redux/public/store';
import {
    removeItem as removeLocalItem,
    updateQty as updateLocalQty,
    selectCartItems,
    clearCart
} from '@/redux/public/features/cart-slice';

import OrderSummary, { OrderItem } from './_components/OrderSummary';
import ManualPayment, {
    ManualPaymentFields,
    PaymentDetails
} from './_components/ManualPayment';
import SuggestionDropdown from './_components/SuggestionDropdown';
import { useGetProductByIdsQuery } from '@/redux/public/api/product-api';
import {
    API_BASE_URL,
    DEFAULT_DELIVERY_PRICE,
    DEFAULT_LOCKED_AMOUNT,
    INSIDE_DHAKA_DELIVERY_PRICE,
    OUTSIDE_DHAKA_DELIVERY_PRICE
} from '@/configs/storefront';
import { bangladeshDivisions } from '@/lib/data/bangladesh';
import { useRouter } from 'next/navigation';
import { useGetSingleCheckDeliveryChargeQuery } from '@/redux/public/api/order';
import { useGetUserInfoQuery } from '@/redux/public/api/auth-api';
import { useUser } from '@/hooks/use-user';
import AnimatedInput from './_components/AnimatedInput';
import { sendGTMEvent } from '@next/third-parties/google';
import { trackMetaFromGtmEvent } from '@/lib/meta-pixel';
import { calculateDiscountedPrice } from '@/lib/offerHelper';
import { useGetCmsOfferQuery } from '@/redux/public/api/offer';
import ShippingSelector from './_components/ShippingSelector';
import { Container } from '@/components/public/common/container';

type PaymentMethod = 'cod' | 'full' | 'delivery_charge';

type DeliveryForm = {
    customer_name: string;
    customer_phone: string;
    secondary_phone?: string;
    division: string;
    district: string;
    thana: string;
    address: string;
    order_note: string;
    payment_type: PaymentMethod;
    payment_method: string;
};

type DistrictShape = { জেলা: string; উপজেলা: string[] };
type BDDataShape = { [division: string]: DistrictShape[] };

const initialForm: DeliveryForm = {
    customer_name: '',
    customer_phone: '',
    secondary_phone: '',
    division: '',
    district: '',
    thana: '',
    address: '',
    order_note: '',
    payment_type: 'cod',
    payment_method: ''
};

const normalize = (s: string) =>
    (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
const isDhakaDistrict = (district: string) => {
    const d = normalize(district);
    return d === 'ঢাকা' || d === 'dhaka';
};

const CheckoutPageMain: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const lines = useAppSelector(selectCartItems);

    // ======================= all cart item ids ==============================
    const productIds = useMemo(
        () => Array.from(new Set(lines.map((l: any) => l?.product?._id))),
        [lines]
    );
    const [shippingType, setShippingType] = useState('inside');

    // ======================= all coupon code state ==============================
    const [coupon, setCoupon] = useState('');
    const [subTotalCoupon, setSubTotal] = useState(0);
    const [totalDiscountCoupon, setTotalDiscount] = useState(0);
    const [totalAmountCoupon, setTotalAmount] = useState(0);

    // ======================= all coupon code state ==============================
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    // ======= db all products using cart item id, then collect unique ids =======
    const {
        data: productsRes,
        isLoading: cartLoading,
        isFetching,
        isError
    } = useGetProductByIdsQuery(
        { product_ids: productIds },
        { skip: productIds.length === 0 }
    );

    const productMap = useMemo(() => {
        const arr = (productsRes as any)?.data ?? [];
        const map = new Map<string, any>();
        for (const p of arr) map.set(p._id, p);
        return map;
    }, [productsRes]);

    // ====================================================================
    // ======= redux toolkit product id compare to live product id  =======
    // ======= then product variant id massing with state id   ============
    // ======= if not matching then more item from redux state  ===========
    // ====================================================================

    useEffect(() => {
        if (!productsRes || productIds.length === 0) return;
        const toRemove: string[] = [];

        for (const line of lines) {
            // @ts-ignore
            const product = productMap.get(line?.product?._id);

            if (!product) {
                toRemove.push(line?.id);
                continue;
            }
            const variant = (product?.variants || [])?.find(
                (v: any) => v._id === line?.variantId
            );
            if (!variant) toRemove.push(line.id);
        }

        if (toRemove.length > 0) {
            toast.error('Some items are no longer available.');
            // FIX: dispatch(removeItem(id)) takes string ID, not object
            toRemove.forEach((id) => dispatch(removeItem(id)));
        }
    }, [productsRes, productIds.length, lines, productMap, dispatch]);

    // ====================================================================
    // ======= active product variant find  =======
    // ======= activeProductVariants_id === line?.variantId   ============
    // ======= then unit price collect from it, and product details  ===========
    // ====================================================================

    /* const items: OrderItem[] = useMemo(() => {
    const out: OrderItem[] = [];

    for (const line of lines) {
      // 1. FIX: Access the ID correctly (Matching your Cart Page structure)
      // If your Redux stores it as line.product.id, use that.
      // @ts-ignore
      const lookupId = line?.product?._id || (line as any).productId;

      const apiProduct = productMap.get(lookupId);

      // 2. FALLBACK: If API hasn't loaded, use the local snapshot (same as Cart Page)
      const activeProduct = apiProduct || (line.product as any);

      // 3. VARIANT LOOKUP: Safe check for variants
      const variant = (activeProduct?.variants || [])?.find(
        (v: any) => v?._id === line?.variantId,
      );

      // 4. PRICE LOGIC: API Sale > API Reg > Local Snapshot > 0
      const price = Number(
        variant?.sale_price ??
          variant?.regular_price ??
          line.priceSnapshot ??
          0,
      );

      // 5. SHIPPING CALCULATION
      let shippingBase = Number(activeProduct?.shipping_cost ?? 0);
      let shippingPerUnit = Number(activeProduct?.shipping_cost_per_unit ?? 0);

      if (activeProduct?.is_free_delivery) {
        shippingBase = 0;
        shippingPerUnit = 0;
      }

      const qty = line.quantity;

      const lineShipping =
        qty > 0 ? shippingBase + Math.max(0, qty - 1) * shippingPerUnit : 0;

      // 6. ADD TO ARRAY (No 'continue' so items show even while loading)
      out.push({
        id: line.id,
        product: {
          _id: activeProduct?._id || lookupId,
          name: activeProduct?.name || "Loading...",
          thumbnail: activeProduct?.thumbnail || activeProduct?.image,
          variant: variant,
          details: line?.product,
        },
        attributes: {
          ...(variant?.attribute_values || {}),
          Size: line.selectedSize?.toString() || "",
          Color: line.selectedColor || "",
        } as Record<string, string>,
        quantity: qty,
        unitPrice: price,
        lineShipping,
      });
    }
    return out;
  }, [lines, productMap]); */

    const { data: offerData } = useGetCmsOfferQuery({});
    const offer = offerData?.data;
    console.log('offer: ', offer);

    const items: OrderItem[] = useMemo(() => {
        const out: OrderItem[] = [];

        for (const line of lines) {
            // @ts-ignore
            const lookupId = line?.product?._id || (line as any).productId;
            const apiProduct = productMap.get(lookupId);
            const activeProduct = apiProduct || (line.product as any);

            const variant = (activeProduct?.variants || [])?.find(
                (v: any) => v?._id === line?.variantId
            );

            // --- PRICE LOGIC WITH OFFER ---
            const regularPrice = Number(
                variant?.regular_price ?? line.priceSnapshot ?? 0
            );
            const standardSellPrice = Number(
                variant?.sale_price ?? regularPrice
            );

            // Calculate the offer price based ONLY on regularPrice
            const specialOfferPrice = calculateDiscountedPrice(
                activeProduct,
                regularPrice,
                offer
            );

            // If offer applied (result is lower than regular), use it; otherwise use standard sell price
            const unitPrice =
                specialOfferPrice < regularPrice
                    ? specialOfferPrice
                    : standardSellPrice;
            // --- END PRICE LOGIC ---

            // SHIPPING CALCULATION
            let shippingBase = Number(activeProduct?.shipping_cost ?? 0);
            let shippingPerUnit = Number(
                activeProduct?.shipping_cost_per_unit ?? 0
            );

            if (activeProduct?.is_free_delivery) {
                shippingBase = 0;
                shippingPerUnit = 0;
            }

            console.log('activeProduct', activeProduct);

            const qty = line.quantity;
            const lineShipping =
                qty > 0
                    ? shippingBase + Math.max(0, qty - 1) * shippingPerUnit
                    : 0;

            out.push({
                id: line.id,
                product: {
                    _id: activeProduct?._id || lookupId,
                    name: activeProduct?.name || 'Loading...',
                    thumbnail: activeProduct?.thumbnail || activeProduct?.image,
                    variant: variant,
                    details: line?.product
                },
                attributes: {
                    ...(variant?.attribute_values || {}),
                    Size: line.selectedSize?.toString() || '',
                    Color: line.selectedColor || ''
                } as Record<string, string>,
                quantity: qty,
                unitPrice: unitPrice, // Using the new calculated price
                lineShipping,
                isFreeDelivery: activeProduct?.is_free_delivery
            });
        }
        return out;
    }, [lines, productMap, offer]); // Added offer to dependencies

    // console.log("items", items);

    // ====================================================================
    // ======= Offer Product  =======
    // ======= Free Delivery Check   ============
    // ======= Eligible Or Not  ===========
    // ====================================================================

    const offerSubIds =
        offer?.applied_subcategories?.map((s: any) => s._id) || [];

    const NeedDeliveryCharge = items?.some((item: any) => {
        // 1. Vendor level free delivery
        const isVendorFree = item?.isFreeDelivery;

        // 2. Offer level: Check campaign status, validity dates, and subcategories
        let isOfferFree = false;

        if (offer) {
            // A. First check: Is the special sale active?
            if (offer.specialSaleActive) {
                // B. Second check: Calculate if the offer is still within its valid days
                const startDate = new Date(offer.offer_start_date);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + offer.validFor);

                const currentDate = new Date();

                // Is today within the start and end dates?
                if (currentDate >= startDate && currentDate <= endDate) {
                    // C. Third check: Does the item match the subcategories AND is freeDelivery true?
                    const productSubCategoriesIds =
                        item?.product?.details?.category?.subcategories || [];
                    const isSubCategoryMatch = productSubCategoriesIds.some(
                        (id: string) => offerSubIds.includes(id)
                    );

                    // If the product belongs to the promotional subcategory and the offer flags free delivery
                    if (isSubCategoryMatch && offer.freeDelivery) {
                        isOfferFree = true;
                    }
                }
            }
        }

        // If it's NOT vendor free AND NOT offer free, then this item requires a delivery charge
        return !isVendorFree && !isOfferFree;
    });

    // console.log("NeedDeliveryCharge", NeedDeliveryCharge);

    // ======================= sub total and regular total ====================
    const sub_total = useMemo(
        () => items.reduce((s, it) => s + it.unitPrice * it.quantity, 0),
        [items]
    );
    const regular_total = useMemo(() => {
        return items.reduce((total, it) => {
            // Use the regular_price if it exists, otherwise fallback to unitPrice
            const price = it.product?.variant?.regular_price ?? it.unitPrice;
            return total + price * it.quantity;
        }, 0);
    }, [items]);
    const isDiscountApply = regular_total - sub_total > 0;

    const [form, setForm] = useState<DeliveryForm>(initialForm);
    const [bdData, setBdData] = useState<BDDataShape>(
        bangladeshDivisions as unknown as BDDataShape
    );
    const divisions = useMemo(() => Object.keys(bdData), [bdData]);
    const districts = useMemo(
        () =>
            form.division
                ? (bdData[form.division]?.map((d) => d.জেলা) ?? [])
                : [],
        [form.division, bdData]
    );
    const thanas = useMemo(() => {
        if (!form.division || !form.district) return [];
        const districtObj = (bdData[form.division] || [])?.find(
            (d) => d.জেলা === form.district
        );
        return districtObj?.উপজেলা ?? [];
    }, [form.division, form.district, bdData]);

    const addressDeliveryCharge = useMemo(() => {
        // 1. If everything is free delivery, charge is always 0
        if (!NeedDeliveryCharge) return 0;

        // 2. If no district is selected yet, return the default price
        if (!shippingType) return DEFAULT_DELIVERY_PRICE;

        // 3. District-based logic
        if (shippingType === 'inside') {
            return INSIDE_DHAKA_DELIVERY_PRICE;
        } else {
            return OUTSIDE_DHAKA_DELIVERY_PRICE;
        }
    }, [shippingType, NeedDeliveryCharge]);

    /* const addressDeliveryCharge = useMemo(() => {
    // 1. If everything is free delivery, charge is always 0
    if (!NeedDeliveryCharge) return 0;

    // 2. If no district is selected yet, return the default price
    if (!form.district) return DEFAULT_DELIVERY_PRICE;

    // 3. District-based logic
    if (isDhakaDistrict(form.district)) {
      return INSIDE_DHAKA_DELIVERY_PRICE;
    } else {
      return OUTSIDE_DHAKA_DELIVERY_PRICE;
    }
  }, [form.district, NeedDeliveryCharge]); */ // Added NeedDeliveryCharge to dependencies

    const perLineShippingTotal = useMemo(
        () => items.reduce((s, it) => s + it.lineShipping, 0),
        [items]
    );

    // default
    const delivery_charge = addressDeliveryCharge;
    const total_discount = totalDiscountCoupon || 0;
    const total_amount = sub_total - total_discount + delivery_charge;

    const { user, isLoading } = useUser();
    const userId = user?._id;

    // ======================================================
    // ======= check COD require or not  ====================
    // ======================================================

    const customerNumber = form?.customer_phone?.replace(/\D/g, '');
    // API Call - will fetch whenever orderQuery changes
    const { data } = useGetSingleCheckDeliveryChargeQuery(
        { phone_no: customerNumber },
        { skip: !customerNumber || customerNumber.length !== 11 }
    );

    const isRequiredDeliveryCharge =
        data?.data?.required_delivery_charge || true;

    const [pay, setPay] = useState<ManualPaymentFields>({
        senderPhone: '',
        trxId: '',
        amount: 0,
        payment_method: 'BKASH'
    });

    /* const deliveryPrice = isDhakaDistrict(form.district)
    ? INSIDE_DHAKA_DELIVERY_PRICE
    : OUTSIDE_DHAKA_DELIVERY_PRICE; */

    // 2. State for the actual delivery price (to be added to total)
    const [deliveryPrice, setDeliveryPrice] = useState(
        INSIDE_DHAKA_DELIVERY_PRICE
    );

    const shippingOptions = [
        {
            id: 'inside',
            label: 'Inside Dhaka',
            price: INSIDE_DHAKA_DELIVERY_PRICE
        },
        {
            id: 'outside',
            label: 'Outside Dhaka',
            price: OUTSIDE_DHAKA_DELIVERY_PRICE
        }
    ];

    // Optional: Auto-select based on district logic if district changes
    useEffect(
        () => {
            const isInside = isDhakaDistrict(form.district);
            handleSelect(isInside ? shippingOptions[0] : shippingOptions[1]);
        },
        [/* form.district */]
    );

    const handleSelect = (option: any) => {
        setShippingType(option.id);
        setDeliveryPrice(option.price); // This updates the value you use for calculations
    };

    const COD_ADVANCE = isRequiredDeliveryCharge
        ? deliveryPrice || DEFAULT_LOCKED_AMOUNT
        : 0;

    const expectedPayNow =
        form.payment_type === 'cod'
            ? 0
            : form.payment_type === 'delivery_charge'
              ? delivery_charge
              : total_amount;

    const setField = (k: keyof DeliveryForm, v: string) => {
        setForm((p) => {
            const next = { ...p, [k]: v };
            if (k === 'division') {
                next.district = '';
                next.thana = '';
            }
            if (k === 'district') {
                next.thana = '';
            }
            return next;
        });
    };
    // create division and district
    const createDivision = (name: string) =>
        setBdData((prev) => (prev[name] ? prev : { ...prev, [name]: [] }));
    const createDistrict = (divisionName: string, districtName: string) =>
        setBdData((prev) => {
            const list = prev[divisionName] ?? [];
            if (
                list.some(
                    (d) => d.জেলা.toLowerCase() === districtName.toLowerCase()
                )
            )
                return prev;
            return {
                ...prev,
                [divisionName]: [...list, { জেলা: districtName, উপজেলা: [] }]
            };
        });

    const changeQty = (lineId: string, newQty: number) => {
        if (newQty < 1) return;
        dispatch(updateLocalQty({ id: lineId, quantity: newQty }));
    };
    const removeItem = (lineId: string) => dispatch(removeLocalItem(lineId));

    const validate = () => {
        const required: (keyof DeliveryForm)[] = [
            'customer_name',
            'customer_phone',
            'address'
        ];
        for (const k of required) {
            if (!String(form[k] || '').trim()) {
                toast.error(`${k.replace('_', ' ')} is required`);
                return false;
            }
        }
        const onlyDigits = form.customer_phone.replace(/\D/g, '');
        console.log('onlyDigits: ', onlyDigits);

        if (onlyDigits.length < 11) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (!items.length) {
            toast.error('Your cart is empty');
            return false;
        }

        const senderDigits = pay.senderPhone.replace(/\D/g, '');
        /* if (senderDigits.length < 11) {
      toast.error("Enter a valid bKash/Nagad number used to send money");
      return false;
    } */
        /*  if (!pay.trxId || pay.trxId.trim().length < 6) {
      toast.error("Enter a valid transaction ID");
      return false;
    } */

        if (form?.payment_type !== 'cod' && uploadedFiles?.length === 0) {
            toast.error(
                'Please provide a payment screenshot to verify your order.'
            );
            return false;
        }

        if (form?.payment_type !== 'cod' && pay.amount !== expectedPayNow) {
            toast.error(`Paid amount must be exactly Tk ${expectedPayNow}`);
            return false;
        }
        return true;
    };

    const payment_type_api =
        form.payment_type === 'cod'
            ? 'CASH_ON_DELIVERY'
            : form.payment_type === 'delivery_charge'
              ? 'DELIVERY_CHARGE'
              : 'FULL_PAYMENT';

    const payable_amount = expectedPayNow;
    const paid_amount =
        form.payment_type === 'delivery_charge'
            ? delivery_charge
            : expectedPayNow;
    // const COD_amount = total_amount - paid_amount;
    const COD_amount = form.payment_type === 'cod' ? total_amount : 0;
    const is_delivery_charge_paid = paid_amount >= delivery_charge;

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState<{ id?: string } | null>(
        null
    );

    const placeOrder = async () => {
        if (!validate()) return;
        setOrderLoading(true);

        try {
            const productsBody = [];

            // Use a loop instead of .map so we can control the flow
            for (const it of items) {
                const line = lines?.find((l) => l.id === it.id);

                // Try to find the product ID from all possible spots

                const productId =
                    // @ts-ignore
                    line?.product?._id || line?.product?.id || it.product._id;
                // @ts-expect-error
                const p = productMap.get(productId) || (line.product as any);

                if (!p) {
                    throw new Error(
                        `Product "${it.product.name}" not found in synced data. Please refresh.`
                    );
                }

                const v = p.variants?.find(
                    (vv: any) => String(vv._id) === String(line?.variantId)
                );

                if (!v) {
                    throw new Error(
                        `The selected version of "${it.product.name}" is no longer available.`
                    );
                }

                // If we got here, p and v are valid. Push to our body.
                productsBody.push({
                    product: p._id,
                    product_name: p.name,
                    total_quantity: it.quantity,
                    total_price:
                        totalAmountCoupon || it.unitPrice * it.quantity,
                    discount_type: 'FLAT',
                    discount_amount: totalDiscountCoupon || 0,
                    total_discount: totalDiscountCoupon || 0,
                    shipping_cost: Number(p.shipping_cost ?? 0),
                    shipping_cost_per_unit: Number(
                        p.shipping_cost_per_unit ?? 0
                    ),
                    total_shipping_cost: p.is_free_delivery
                        ? 0
                        : it.lineShipping,
                    is_free_delivery: Boolean(p.is_free_delivery),
                    coin_per_order: Number(p.coin_per_order ?? 0),
                    selected_variant: {
                        _id: String(v._id),
                        attributes: (v.attributes ?? []) as string[],
                        attribute_values: (v.attribute_values ?? {}) as Record<
                            string,
                            string
                        >,
                        regular_price: Number(v.regular_price ?? it.unitPrice),
                        sale_price: Number(v.sale_price ?? it.unitPrice),
                        sku: String(v.sku ?? ''),
                        barcode: String(v.barcode ?? ''),
                        product: {
                            _id: p._id,
                            name: p.name,
                            slug: p.slug,
                            thumbnail: p.thumbnail
                        }
                    }
                });
            }

            const payload = {
                // Spreads the coupon key only if 'coupon' exists
                ...(coupon && { coupon: coupon }),
                order_by: !isLoading && userId ? 'USER' : 'GUEST',
                ...(!isLoading && userId ? { user: userId } : {}), // Optional: Include if you have user
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                payment_type: payment_type_api,
                payment_id: pay.trxId,
                sub_total,
                total_discount,
                delivery_charge,
                total_amount: totalAmountCoupon || total_amount,
                payable_amount,
                COD: COD_amount,
                paid_amount,
                products: productsBody,
                is_delivery_charge_paid: is_delivery_charge_paid,
                delivery_address: {
                    division: form.division,
                    district: form.district,
                    thana: form.thana,
                    address: form.address
                },
                order_note: `${form.order_note || ''}`,
                sender_number: pay.senderPhone,
                files: uploadedFiles,
                payment_method:
                    form?.payment_type === 'cod' ? '' : pay?.payment_method
            };

            console.log('payload:', payload);

            const res = await fetch(`${API_BASE_URL}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: Cookies.get('cbd_atkn_91f2a') ?? '',
                    'x-refresh-token': Cookies.get('cbd_rtkn_7c4d1') ?? ''
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.message || `Order failed with status ${res.status}`
                );
            }

            if (res) {
                // GTM - ITEMS
                const gtmItems = items.map((it: any) => ({
                    item_id: it.product?._id,
                    item_name: it.product?.name,
                    item_category: it.product?.category?.name_en || '',
                    item_variant: {
                        size: it.attributes?.size,
                        variant: [it.attributes?.size].filter(Boolean).join('/')
                    },
                    price: Number(it.unitPrice || it.priceSnapshot) || 0,
                    quantity: Number(it.quantity) || 1
                }));

                const ecommerce = {
                    transaction_id: pay.trxId,
                    value: Number(payload.total_amount),
                    tax: 0,
                    shipping: Number(payload.delivery_charge),
                    currency: 'BDT',
                    coupon: coupon || '',
                    items: gtmItems
                };

                sendGTMEvent?.({ event: 'purchase', ecommerce });
                trackMetaFromGtmEvent('purchase', ecommerce);

                sessionStorage?.setItem(
                    'lastOrder',
                    JSON.stringify(data?.data)
                );
                setOrderPlaced({ id: data?.data?._id });
                toast.success('Order placed successfully!');
                router.push('/order-success');
                dispatch(clearCart());
            }
        } catch (e: any) {
            console.error('Order process stopped:', e.message);
            toast.error(e.message);
        } finally {
            setOrderLoading(false);
        }
    };

    const isEmpty = items.length === 0;

    const labelClass = 'mb-2 block text-sm text-[#1A1A1A]';

    return (
        <div className='min-h-screen bg-gray-50/50'>
            <Container className='py-2 lg:py-6'>
                {isError && (
                    <div className='mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                        <Info className='h-4 w-4' />
                        Could not validate products at the moment. You can still
                        review your cart.
                    </div>
                )}

                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* LEFT */}
                    <div className='space-y-6 md:col-span-2'>
                        {/* Delivery Form */}
                        <Card className='rounded-xl border-0 bg-white shadow-none'>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='base-medium'>
                                        Delivery Information
                                    </CardTitle>
                                    <ShieldCheck className='h-5 w-5 text-emerald-600' />
                                </div>
                            </CardHeader>

                            <CardContent className='space-y-4'>
                                {cartLoading ? (
                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                        <Skeleton className='h-12 w-full rounded-lg' />
                                        <Skeleton className='h-12 w-full rounded-lg' />
                                        <Skeleton className='h-12 w-full rounded-lg' />
                                        <Skeleton className='h-12 w-full rounded-lg' />
                                        <Skeleton className='h-12 w-full rounded-lg' />
                                        <Skeleton className='h-24 w-full rounded-lg md:col-span-2' />
                                    </div>
                                ) : (
                                    <>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div>
                                                <Label
                                                    htmlFor='customer_name'
                                                    className={labelClass}
                                                >
                                                    Full Name *
                                                </Label>
                                                <AnimatedInput
                                                    id='customer_name'
                                                    value={form.customer_name}
                                                    onChange={(val) =>
                                                        setField(
                                                            'customer_name',
                                                            val
                                                        )
                                                    }
                                                    placeholder='Enter your name'
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor='customer_phone'
                                                    className={labelClass}
                                                >
                                                    Phone Number *{' '}
                                                    {!COD_ADVANCE && `✅`}
                                                </Label>

                                                <AnimatedInput
                                                    id='customer_phone'
                                                    value={form.customer_phone}
                                                    onChange={(val) =>
                                                        setField(
                                                            'customer_phone',
                                                            val
                                                        )
                                                    }
                                                    placeholder='Enter your phone number'
                                                />
                                            </div>
                                        </div>

                                        {/* Division / District / Thana */}
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div>
                                                <Label className={labelClass}>
                                                    Division (optional)
                                                </Label>
                                                <SuggestionDropdown
                                                    value={form.division}
                                                    onChange={(v) =>
                                                        setField('division', v)
                                                    }
                                                    options={divisions}
                                                    placeholder='Select or add Division'
                                                    creatable
                                                    onCreate={(name) => {
                                                        createDivision(name);
                                                        setField(
                                                            'division',
                                                            name
                                                        );
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <Label className={labelClass}>
                                                    District (optional)
                                                </Label>
                                                <SuggestionDropdown
                                                    value={form.district}
                                                    onChange={(v) =>
                                                        setField('district', v)
                                                    }
                                                    options={districts}
                                                    placeholder='Select or add District'
                                                    disabled={!form.division}
                                                    required
                                                    creatable
                                                    onCreate={(name) => {
                                                        if (!form.division)
                                                            return toast.error(
                                                                'Select a division first'
                                                            );
                                                        createDistrict(
                                                            form.division,
                                                            name
                                                        );
                                                        setField(
                                                            'district',
                                                            name
                                                        );
                                                    }}
                                                />
                                            </div>

                                            {/* <div>
                        <Label className={labelClass}>Thana / Upazila *</Label>
                        <SuggestionDropdown
                          value={form.thana}
                          onChange={(v) => setField("thana", v)}
                          options={thanas}
                          placeholder="Select Thana / Upazila"
                          disabled={!form.district}
                          required
                        />
                      </div> */}
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor='address'
                                                className={labelClass}
                                            >
                                                Delivery Address *
                                            </Label>
                                            <Textarea
                                                id='address'
                                                className='rounded-lg placeholder:text-sm focus-visible:ring-[#ff5c00]'
                                                rows={2}
                                                value={form.address}
                                                onChange={(e) =>
                                                    setField(
                                                        'address',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='House / Road / Area'
                                            />
                                        </div>

                                        <ShippingSelector
                                            options={shippingOptions}
                                            selectedValue={shippingType}
                                            onSelect={handleSelect}
                                        />

                                        <div>
                                            <Label
                                                htmlFor='order_note'
                                                className={labelClass}
                                            >
                                                Order Note (Optional)
                                            </Label>
                                            <AnimatedInput
                                                id='order_note'
                                                placeholder='Any special instruction (optional)'
                                                value={form.order_note}
                                                // onChange={(e) => setField("order_note", e.target.value)}
                                                onChange={(val) =>
                                                    setField('order_note', val)
                                                }
                                            />
                                            {/* <Textarea
                        className="rounded-lg focus-visible:ring-[#ff5c00] placeholder:text-sm"
                        rows={2}
                        placeholder="Any special instruction (optional)"
                        value={form.order_note}
                        onChange={(e) => setField("order_note", e.target.value)}
                      /> */}
                                        </div>

                                        {/* Payment method */}
                                        <div className='pt-2'>
                                            <Label className={labelClass}>
                                                Payment Type
                                            </Label>
                                            <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                                                {/* Cash on Delivery */}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setField(
                                                            'payment_type',
                                                            'cod'
                                                        )
                                                    }
                                                    className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                                                        form.payment_type ===
                                                        'cod'
                                                            ? 'border-tertiary bg-tertiary/5 text-primary-ink'
                                                            : 'hover:border-tertiary border-gray-300'
                                                    }`}
                                                >
                                                    Cash on Delivery
                                                </button>

                                                {/* Pay Delivery Charge Only */}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setField(
                                                            'payment_type',
                                                            'delivery_charge'
                                                        )
                                                    }
                                                    className={`${delivery_charge === 0 ? 'hidden' : 'block'} rounded-lg border px-4 py-3 text-sm transition-colors ${
                                                        // FIXED: Changed from "full" to "delivery_charge"
                                                        form.payment_type ===
                                                        'delivery_charge'
                                                            ? 'border-tertiary bg-tertiary/5 text-primary-ink'
                                                            : 'hover:border-tertiary border-gray-300'
                                                    }`}
                                                >
                                                    Pay Delivery Charge Only
                                                </button>

                                                {/* Full Payment (Manual) */}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setField(
                                                            'payment_type',
                                                            'full'
                                                        )
                                                    }
                                                    className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                                                        form.payment_type ===
                                                        'full'
                                                            ? 'border-tertiary bg-tertiary/5 text-primary-ink'
                                                            : 'hover:border-tertiary border-gray-300'
                                                    }`}
                                                >
                                                    Full Payment (Manual)
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Manual Payment Panel (NEW) */}
                        {form.payment_type === 'cod' ? (
                            ''
                        ) : (
                            <ManualPayment
                                mode={form.payment_type}
                                amountNow={expectedPayNow}
                                fields={pay}
                                onChange={(patch) =>
                                    setPay((p) => ({ ...p, ...patch }))
                                }
                                instructionImageSrc='/order-instruction.png'
                                setUploadedFiles={setUploadedFiles}
                            />
                        )}
                    </div>

                    {/* RIGHT: Summary (separate component) */}
                    <div className='md:col-span-1'>
                        <OrderSummary
                            items={items}
                            isLoading={cartLoading}
                            isFetching={isFetching}
                            onInc={(id, next) => changeQty(id, next)}
                            onDec={(id, next) => changeQty(id, next)}
                            onRemove={(id) => removeItem(id)}
                            // regular, sub, isApply
                            regularTotal={regular_total}
                            subTotal={sub_total}
                            isDiscountApply={isDiscountApply}
                            perLineShippingTotal={perLineShippingTotal}
                            deliveryCharge={delivery_charge}
                            totalDiscount={total_discount}
                            totalAmount={total_amount}
                            payableNow={expectedPayNow}
                            ctaDisabled={cartLoading || isEmpty || orderLoading}
                            ctaLabel={
                                orderLoading ? 'Placing...' : 'Place Order'
                            }
                            onPlaceOrder={placeOrder}
                            // coupon
                            coupon={coupon}
                            setCoupon={setCoupon}
                            subTotalCoupon={subTotalCoupon}
                            setSubTotal={setSubTotal}
                            totalDiscountCoupon={totalDiscountCoupon}
                            setTotalDiscount={setTotalDiscount}
                            totalAmountCoupon={totalAmountCoupon}
                            setTotalAmount={setTotalAmount}
                            // payment details
                            fields={pay}
                            onChange={(patch: any) =>
                                setPay((p) => ({ ...p, ...patch }))
                            }
                            setUploadedFiles={setUploadedFiles}
                            payment_type={form.payment_type}
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CheckoutPageMain;
