'use client';

import React, {
    Dispatch,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Input } from '@/components/ui/admin-input';
import { Button } from '@/components/ui/admin-button';
import { Switch } from '@/components/ui/switch';
import { InlineColorPicker } from '@/components/ui/color-picker';
import { Plus, Trash, X, ImagePlus, GripVertical } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import debounce from 'lodash/debounce';
import {
    defaultAttributesData,
    defaultVariationData
} from '@/constants/defaultVariationData';
import Image from 'next/image';
import { getImgFullUrl } from '@/lib/admin-utils';
import { useUploadMultipleFileToAWSMutation } from '@/redux/api-queries/file-upload-api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface Attribute {
    name: string;
    values: string[];
}

// ✅ Structure for attribute value images: { "Color": { "Red": ["url1", "url2"] } }
type AttributeValueImagesMap = Record<string, Record<string, string[]>>;

// ✅ Structure for attribute value color codes: { "Color": { "Red": "#FF0000" } }
type AttributeValueColorCodesMap = Record<string, Record<string, string>>;

type VariantCombination = Record<string, string>;

interface VariantData {
    _id?: string; // ✅ keep for update
    combination: VariantCombination;
    sale_price: string;
    regular_price: string;
    sku: string;
    barcode?: string;
    images?: string[]; // ✅ variant-specific images
    serial?: number; // ✅ serial number for ordering
    image_based_on?: string; // ✅ which attribute's images to use
    color_code?: string; // ✅ hex color code for this variant
}

export type TAttributesAndVariantsData = {
    attributes: string[];
    variants: {
        _id?: string; // ✅ send to backend (undefined => create)
        attribute_values: VariantCombination;
        sale_price: number;
        regular_price: number;
        sku: string;
        barcode?: string;
        images?: string[]; // ✅ variant images
        serial?: number; // ✅ serial number
        image_based_on?: string; // ✅ which attribute's images to use
        color_code?: string; // ✅ hex color code for this variant
    }[];
};

type TAddVariantsProps = {
    onChange: Dispatch<TAttributesAndVariantsData | null>;
    defaultRegularPrice: string | number;
    defaultSalePrice: string | number;
    defaultValue?: any | null; // can contain variants with _id
    rootLevelSKU?: string;
    setRootLevelSKU?: Dispatch<React.SetStateAction<string>>;
    sliderImages?: string[]; // ✅ pre-uploaded slider URLs from parent
};

const makeSig = (obj: Record<string, string>) =>
    Object.keys(obj)
        .sort()
        .map((k) => `${k}:${String(obj[k]).trim()}`)
        .join('|');

const isSubset = (small: VariantCombination, big: VariantCombination) =>
    Object.entries(small).every(
        ([k, v]) => String(big?.[k] ?? '').trim() === String(v ?? '').trim()
    );

const sameKeys = (a: VariantCombination, b: VariantCombination) => {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    for (let i = 0; i < ak.length; i++) if (ak[i] !== bk[i]) return false;
    return true;
};

const matchScore = (a: VariantCombination, b: VariantCombination) => {
    const keys = Object.keys(a);
    let score = 0;
    for (const k of keys) {
        if (String(a[k]).trim() === String(b[k]).trim()) score += 1;
    }
    return score;
};

const genSku = (root: string | undefined, combo: VariantCombination) => {
    const base = (root || '').trim().toUpperCase();
    if (!base) return '';
    const parts = Object.values(combo).map((v) =>
        String(v).trim().toUpperCase()
    );
    return parts.length ? `${base}-${parts.join('-')}` : base;
};

const shouldAutoRegenerateSku = (
    currentSku: string,
    root: string | undefined,
    oldCombo: VariantCombination
) => {
    const sku = (currentSku || '').trim().toUpperCase();
    if (!sku) return true;
    const expectedOld = genSku(root, oldCombo);
    return expectedOld && sku === expectedOld;
};

const AttributesAndVariantsUpdate: React.FC<TAddVariantsProps> = ({
    onChange,
    defaultRegularPrice,
    defaultSalePrice,
    defaultValue,
    rootLevelSKU,
    setRootLevelSKU,
    sliderImages = [] // ✅ pre-uploaded slider URLs
}) => {
    const [attributes, setAttributes] = useState<Attribute[]>([
        ...defaultAttributesData
    ]);
    const [variantData, setVariantData] = useState<VariantData[]>([
        ...defaultVariationData
    ]);

    // ✅ baseline snapshot (initial load) helps keep _id even if user already changed things
    const [baseVariants, setBaseVariants] = useState<VariantData[]>([]);

    const [defaultSale, setDefaultSale] = useState(String(defaultSalePrice));
    const [defaultRegular, setDefaultRegular] = useState(
        String(defaultRegularPrice)
    );

    // ✅ State for attribute value images: { "Color": { "Red": ["url1", "url2"] } }
    const [attributeValueImages, setAttributeValueImages] =
        useState<AttributeValueImagesMap>({});

    // ✅ State for attribute value color codes: { "Color": { "Red": "#FF0000" } }
    const [attributeValueColorCodes, setAttributeValueColorCodes] =
        useState<AttributeValueColorCodesMap>({});

    // ✅ State for which attribute's images should be used for variants
    const [imageBasedOn, setImageBasedOn] = useState<string | null>(null);

    // ✅ file upload api mutation hook
    const [uploadMultipleFile, { isLoading: isUploadingImage }] =
        useUploadMultipleFileToAWSMutation();

    // Memoize attributeMap
    const attributeMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        attributes?.forEach((attr) => {
            const name = (attr?.name || '').trim();
            const vals = (attr.values || [])
                .map((v) => String(v || '').trim())
                .filter(Boolean);
            if (name && vals.length) map[name] = vals;
        });
        return map;
    }, [attributes]);

    // Memoize variant combinations generation
    const variantCombinations = useMemo(() => {
        const keys = Object.keys(attributeMap);

        const combine = (
            index = 0,
            current: VariantCombination = {}
        ): VariantCombination[] => {
            if (index === keys.length) return [current];
            const key = keys[index];
            const values = attributeMap[key] || [];
            const out: VariantCombination[] = [];

            for (const value of values) {
                out.push(...combine(index + 1, { ...current, [key]: value }));
            }
            return out;
        };

        return combine();
    }, [attributeMap]);

    // ✅ Apply attribute value images to a variant combination
    const applyAttributeValueImagesToVariant = useCallback(
        (combination: VariantCombination): string[] => {
            const images: string[] = [];

            // If imageBasedOn is set, only use images from that attribute
            if (imageBasedOn && combination[imageBasedOn]) {
                const attrImages =
                    attributeValueImages[imageBasedOn]?.[
                        String(combination[imageBasedOn])
                    ] || [];
                images.push(...attrImages);
            } else {
                // Otherwise, collect images from all attribute values
                Object.entries(combination).forEach(([attrName, value]) => {
                    const attrImages =
                        attributeValueImages[attrName]?.[String(value)] || [];
                    images.push(...attrImages);
                });
            }

            return images;
        },
        [attributeValueImages, imageBasedOn]
    );

    // ✅ Apply attribute value color codes to a variant combination
    const applyAttributeValueColorCodesToVariant = useCallback(
        (combination: VariantCombination): string | undefined => {
            // If imageBasedOn is set, return color code from that attribute
            if (imageBasedOn && combination[imageBasedOn]) {
                return attributeValueColorCodes[imageBasedOn]?.[
                    String(combination[imageBasedOn])
                ];
            }
            return undefined;
        },
        [attributeValueColorCodes, imageBasedOn]
    );

    // ✅ Handler for toggling image-based-on attribute
    const handleToggleImageBasedOn = useCallback((attrName: string) => {
        setImageBasedOn((prev) => {
            // If clicking the same attribute that's already selected, deselect it
            // Otherwise, select the new attribute (only one at a time)
            if (prev === attrName) {
                return null;
            }
            return attrName;
        });
    }, []);

    // ✅ Handler for color code change
    const handleColorCodeChange = useCallback(
        (attrName: string, value: string, colorCode: string) => {
            setAttributeValueColorCodes((prev) => {
                const attrMap = prev[attrName] || {};
                return {
                    ...prev,
                    [attrName]: {
                        ...attrMap,
                        [value]: colorCode
                    }
                };
            });
        },
        []
    );

    const handleApplyDefaultPricesAndSKUToAll = () => {
        setVariantData((prev) => {
            const attributeOrders = new Map<string, string[]>();

            for (const variant of prev) {
                const comb = (variant.combination ?? {}) as Record<
                    string,
                    string | number
                >;
                for (const [attr, rawVal] of Object.entries(comb)) {
                    const val = String(rawVal);
                    if (!attributeOrders.has(attr))
                        attributeOrders.set(attr, []);
                    const arr = attributeOrders.get(attr)!;
                    if (!arr.includes(val)) arr.push(val);
                }
            }

            const keys = Array.from(attributeOrders.keys());
            const primary = keys.find((a) => /size/i.test(a)) || keys[0] || '';

            const root = (rootLevelSKU || '').trim().toUpperCase();

            // normalize helper
            const norm = (v: unknown) =>
                String(v ?? '')
                    .trim()
                    .replace(/\s+/g, '') // remove internal spaces (optional but keeps SKU clean)
                    .toUpperCase();

            // ✅ IMPORTANT: return the mapped array
            return prev.map((variant) => {
                const nextCombo: any = (variant.combination ?? {}) as Record<
                    string,
                    string | number
                >;

                // ✅ primary first, then others in sorted key order (stable)
                const primaryValRaw = primary ? nextCombo[primary] : '';
                const primaryVal = primaryValRaw ? norm(primaryValRaw) : '';

                const otherValues = Object.keys(nextCombo)
                    .filter((k) => k !== primary)
                    .sort()
                    .map((k) => norm(nextCombo[k]))
                    .filter(Boolean);

                const parts = [primaryVal, ...otherValues].filter(Boolean);

                const autoSku =
                    parts.length > 0 ? `${root}-${parts.join('-')}` : root;

                // only overwrite sku if empty OR sku equals root sku OR sku equals auto-generated from current combo
                const canOverwriteSku =
                    !variant.sku ||
                    variant.sku === (rootLevelSKU || '') ||
                    shouldAutoRegenerateSku(
                        variant.sku,
                        rootLevelSKU,
                        nextCombo
                    );

                return {
                    ...variant,
                    sale_price: defaultSale,
                    regular_price: defaultRegular,
                    sku: canOverwriteSku ? autoSku : variant.sku
                };
            });
        });
    };

    useEffect(() => {
        setDefaultSale(String(defaultSalePrice));
        setDefaultRegular(String(defaultRegularPrice));
    }, [defaultRegularPrice, defaultSalePrice]);

    /**
     * ✅ CORE FIX: regenerate variantData from combinations WITHOUT losing _id
     *
     * Priority:
     * 1) exact sig match from current list
     * 2) exact sig match from base list
     * 3) same-keys best score (rename value case)
     * 4) subset mapping (old -> new) for attribute ADD (old combo subset of new combo)
     * 5) superset mapping (new -> old) for attribute REMOVE (new combo subset of old combo)
     * 6) otherwise new row (_id undefined)
     *
     * Extra: sku auto-regenerates only if it was auto-generated before.
     */
    useEffect(() => {
        setVariantData((prev) => {
            const prevList = Array.isArray(prev) ? prev : [];
            const baseList = Array.isArray(baseVariants) ? baseVariants : [];

            const prevBySig = new Map<string, VariantData>();
            prevList.forEach((v) => prevBySig.set(makeSig(v.combination), v));

            const baseBySig = new Map<string, VariantData>();
            baseList.forEach((v) => baseBySig.set(makeSig(v.combination), v));

            // prevent reusing same _id for multiple new combos
            const usedIds = new Set<string>();

            const tryTake = (v?: VariantData | null) => {
                if (!v) return null;
                const id = v._id ? String(v._id) : '';
                if (id && usedIds.has(id)) return null;
                if (id) usedIds.add(id);
                return v;
            };

            const pool = [...prevList, ...baseList];

            const updatedData: VariantData[] = variantCombinations.map(
                (combo) => {
                    const sig = makeSig(combo);

                    // 1) exact current
                    const exactPrev = tryTake(prevBySig.get(sig));
                    if (exactPrev) return exactPrev;

                    // 2) exact base
                    const exactBase = tryTake(baseBySig.get(sig));
                    if (exactBase) {
                        const auto = shouldAutoRegenerateSku(
                            exactBase.sku,
                            rootLevelSKU,
                            exactBase.combination
                        );
                        return {
                            ...exactBase,
                            combination: combo,
                            // keep prices if exist, otherwise defaults
                            sale_price:
                                exactBase.sale_price ?? String(defaultSale),
                            regular_price:
                                exactBase.regular_price ??
                                String(defaultRegular),
                            sku: auto
                                ? genSku(rootLevelSKU, combo)
                                : exactBase.sku
                        };
                    }

                    // 3) same keys best score (rename value)
                    let bestSame: VariantData | null = null;
                    let bestScore = -1;

                    for (const cand of pool) {
                        if (!sameKeys(cand.combination, combo)) continue;

                        const cid = cand._id ? String(cand._id) : '';
                        if (cid && usedIds.has(cid)) continue;

                        const sc = matchScore(cand.combination, combo);
                        if (sc > bestScore) {
                            bestScore = sc;
                            bestSame = cand;
                        }
                    }

                    if (bestSame) {
                        const keysCount = Object.keys(combo).length;
                        const minScore = Math.max(1, keysCount - 1); // 2/3 match for Heel rename
                        if (bestScore >= minScore) {
                            const taken = tryTake(bestSame);
                            if (taken) {
                                const auto = shouldAutoRegenerateSku(
                                    taken.sku,
                                    rootLevelSKU,
                                    taken.combination
                                );
                                return {
                                    ...taken,
                                    combination: combo,
                                    sku: auto
                                        ? genSku(rootLevelSKU, combo)
                                        : taken.sku
                                };
                            }
                        }
                    }

                    // 4) subset mapping for ADD attribute (old ⊂ new)
                    // old has fewer keys; new has more keys
                    let subsetPick: VariantData | null = null;
                    for (const cand of pool) {
                        const cid = cand._id ? String(cand._id) : '';
                        if (cid && usedIds.has(cid)) continue;
                        if (isSubset(cand.combination, combo)) {
                            subsetPick = cand;
                            break; // deterministic: first match => maps to "first value" combos
                        }
                    }
                    if (subsetPick) {
                        const taken = tryTake(subsetPick);
                        if (taken) {
                            const auto = shouldAutoRegenerateSku(
                                taken.sku,
                                rootLevelSKU,
                                taken.combination
                            );
                            return {
                                ...taken,
                                combination: combo,
                                sku: auto
                                    ? genSku(rootLevelSKU, combo)
                                    : taken.sku
                            };
                        }
                    }

                    // 5) SUPERSET mapping for REMOVE attribute (new ⊂ old)
                    // new has fewer keys; old has more keys
                    let supersetPick: VariantData | null = null;
                    for (const cand of pool) {
                        const cid = cand._id ? String(cand._id) : '';
                        if (cid && usedIds.has(cid)) continue;
                        if (isSubset(combo, cand.combination)) {
                            supersetPick = cand;
                            break; // deterministic: keep first unused old variant for this collapsed combo
                        }
                    }
                    if (supersetPick) {
                        const taken = tryTake(supersetPick);
                        if (taken) {
                            const auto = shouldAutoRegenerateSku(
                                taken.sku,
                                rootLevelSKU,
                                taken.combination
                            );
                            return {
                                ...taken,
                                combination: combo,
                                sku: auto
                                    ? genSku(rootLevelSKU, combo)
                                    : taken.sku
                            };
                        }
                    }

                    // 6) new
                    return {
                        _id: undefined,
                        combination: combo,
                        sale_price: String(defaultSale),
                        regular_price: String(defaultRegular),
                        sku: '',
                        barcode: '',
                        images: [], // ✅ empty images array for new variants
                        serial: undefined // ✅ serial will be assigned from index
                    };
                }
            );

            // ✅ Assign serial numbers based on index after regeneration
            // Serial is always index + 1 when combinations are regenerated due to attribute reordering
            const withSerial = updatedData.map((v, idx) => ({
                ...v,
                serial: idx + 1, // ✅ always assign index + 1 as serial
                color_code: applyAttributeValueColorCodesToVariant(
                    v.combination
                ) // ✅ apply color codes
            }));

            return withSerial;
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        variantCombinations,
        defaultSale,
        defaultRegular,
        baseVariants,
        rootLevelSKU
    ]);

    // Load initial defaultValue (update screen)
    useEffect(() => {
        if (!defaultValue) {
            setAttributes([...defaultAttributesData]);
            setVariantData([...defaultVariationData]);
            setBaseVariants([]);
            return;
        }

        const attrsFromApi: string[] = Array.isArray(defaultValue.attributes)
            ? defaultValue.attributes
            : [];
        const varsFromApi: any[] = Array.isArray(defaultValue.variants)
            ? defaultValue.variants
            : [];

        const uniqueAttributes: Attribute[] = attrsFromApi.map((attrName) => {
            const values = Array.from(
                new Set(
                    varsFromApi
                        .map((v) => v?.attribute_values?.[attrName])
                        .filter(
                            (x) => typeof x === 'string' && x.trim().length > 0
                        )
                )
            );
            return { name: attrName, values };
        });

        const mappedVariants: VariantData[] = varsFromApi.map((v, idx) => ({
            _id: v?._id ?? undefined,
            combination: v?.attribute_values || {},
            sale_price: String(v?.sale_price ?? defaultSalePrice),
            regular_price: String(v?.regular_price ?? defaultRegularPrice),
            sku: v?.sku ?? '',
            barcode: v?.barcode ?? '',
            images: v?.images || [], // ✅ variant images
            serial: v?.serial ?? idx + 1, // ✅ use existing serial or generate from index
            image_based_on: v?.image_based_on, // ✅ include image_based_on
            color_code: v?.color_code // ✅ include color_code
        }));

        setAttributes(uniqueAttributes);
        setVariantData(mappedVariants);
        setBaseVariants(mappedVariants); // ✅ baseline snapshot

        // ✅ Set imageBasedOn from existing variant data if available
        const firstVariantWithImageBasedOn = varsFromApi?.find(
            (v: any) => v?.image_based_on
        );
        if (firstVariantWithImageBasedOn?.image_based_on) {
            setImageBasedOn(firstVariantWithImageBasedOn.image_based_on);
        }

        // ✅ Populate attributeValueImages from existing variants
        // Reconstruct attribute value images from variant images based on image_based_on attribute
        const initialAttributeValueImages: AttributeValueImagesMap = {};
        const imageBasedOnAttr = firstVariantWithImageBasedOn?.image_based_on;

        if (imageBasedOnAttr) {
            // Group images by attribute value (e.g., "Color" -> "Red" -> [url1, url2])
            varsFromApi.forEach((variant: any) => {
                const attrValue = variant?.attribute_values?.[imageBasedOnAttr];
                if (attrValue && variant?.images?.length > 0) {
                    if (!initialAttributeValueImages[imageBasedOnAttr]) {
                        initialAttributeValueImages[imageBasedOnAttr] = {};
                    }
                    if (
                        !initialAttributeValueImages[imageBasedOnAttr][
                            attrValue
                        ]
                    ) {
                        initialAttributeValueImages[imageBasedOnAttr][
                            attrValue
                        ] = [];
                    }
                    // Add unique images only
                    variant.images.forEach((imgUrl: string) => {
                        if (
                            !initialAttributeValueImages[imageBasedOnAttr][
                                attrValue
                            ].includes(imgUrl)
                        ) {
                            initialAttributeValueImages[imageBasedOnAttr][
                                attrValue
                            ].push(imgUrl);
                        }
                    });
                }
            });
        }

        setAttributeValueImages(initialAttributeValueImages);

        // ✅ Populate attributeValueColorCodes from existing variants
        const initialAttributeValueColorCodes: AttributeValueColorCodesMap = {};

        if (imageBasedOnAttr) {
            varsFromApi.forEach((variant: any) => {
                const attrValue = variant?.attribute_values?.[imageBasedOnAttr];
                const colorCode = variant?.color_code;
                if (attrValue && colorCode) {
                    if (!initialAttributeValueColorCodes[imageBasedOnAttr]) {
                        initialAttributeValueColorCodes[imageBasedOnAttr] = {};
                    }
                    initialAttributeValueColorCodes[imageBasedOnAttr][
                        attrValue
                    ] = colorCode;
                }
            });
        }

        setAttributeValueColorCodes(initialAttributeValueColorCodes);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced onChange to limit calls
    const debouncedOnChange = useMemo(
        () =>
            debounce((attrs: Attribute[], variants: VariantData[]) => {
                const cleanedAttrs = attrs
                    .map((a) => (a.name || '').trim())
                    .filter(Boolean);

                if (cleanedAttrs.length) {
                    const formatted: TAttributesAndVariantsData = {
                        attributes: cleanedAttrs,
                        variants: variants.map((v, idx) => ({
                            _id: v._id, // ✅ send it
                            attribute_values: v.combination,
                            sale_price: Number(v.sale_price || 0),
                            regular_price: Number(v.regular_price || 0),
                            sku: v.sku || '',
                            barcode: v.barcode || '',
                            images: v.images || [], // ✅ include images
                            serial: v.serial ?? idx + 1, // ✅ include serial (use existing or generate from index)
                            image_based_on: v.image_based_on, // ✅ include image_based_on
                            color_code: v.color_code // ✅ include color_code
                        }))
                    };
                    onChange(formatted);
                } else {
                    onChange(null);
                }
            }, 300),
        [onChange]
    );

    useEffect(() => {
        debouncedOnChange(attributes, variantData);
    }, [attributes, variantData, debouncedOnChange]);

    // Handlers - memoized for performance
    const handleAttributeChange = useCallback(
        (index: number, value: string) => {
            setAttributes((prev) => {
                const newAttributes = [...prev];
                newAttributes[index] = { ...newAttributes[index], name: value };
                return newAttributes;
            });
        },
        []
    );

    const handleValueChange = useCallback(
        (attrIndex: number, valIndex: number, value: string) => {
            setAttributes((prev) => {
                const newAttributes = [...prev];
                const newValues = [...newAttributes[attrIndex].values];
                newValues[valIndex] = value;
                newAttributes[attrIndex] = {
                    ...newAttributes[attrIndex],
                    values: newValues
                };
                return newAttributes;
            });
        },
        []
    );

    const addAttribute = useCallback(() => {
        setAttributes((prev) => {
            if (prev?.length >= 3) return prev;
            return [...prev, { name: '', values: [''] }];
        });
    }, []);

    const removeAttribute = useCallback((index: number) => {
        setAttributes((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const addValue = useCallback((index: number) => {
        setAttributes((prev) => {
            const newAttributes = [...prev];
            newAttributes[index] = {
                ...newAttributes[index],
                values: [...newAttributes[index].values, '']
            };
            return newAttributes;
        });
    }, []);

    const removeValue = useCallback((attrIndex: number, valIndex: number) => {
        setAttributes((prev) => {
            const newAttributes = [...prev];
            const newValues = [...newAttributes[attrIndex].values];
            newValues.splice(valIndex, 1);
            newAttributes[attrIndex] = {
                ...newAttributes[attrIndex],
                values: newValues
            };
            return newAttributes;
        });
    }, []);

    // ✅ Drag and drop handlers for reordering attribute values
    const handleDragStart = useCallback(
        (e: React.DragEvent, attrIndex: number, valIndex: number) => {
            e.dataTransfer.setData('attrIndex', String(attrIndex));
            e.dataTransfer.setData('valIndex', String(valIndex));
        },
        []
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(
        (
            e: React.DragEvent,
            targetAttrIndex: number,
            targetValIndex: number
        ) => {
            e.preventDefault();
            const sourceAttrIndex = parseInt(
                e.dataTransfer.getData('attrIndex')
            );
            const sourceValIndex = parseInt(e.dataTransfer.getData('valIndex'));

            // Only allow reordering within the same attribute
            if (sourceAttrIndex !== targetAttrIndex) return;

            setAttributes((prev) => {
                const newAttributes = [...prev];
                const values = [...newAttributes[sourceAttrIndex].values];
                const [removed] = values.splice(sourceValIndex, 1);
                values.splice(targetValIndex, 0, removed);
                newAttributes[sourceAttrIndex] = {
                    ...newAttributes[sourceAttrIndex],
                    values
                };
                return newAttributes;
            });
        },
        []
    );

    const handleVariantInputChange = useCallback(
        (
            index: number,
            field: keyof Omit<VariantData, 'combination'>,
            value: string
        ) => {
            setVariantData((prev) => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    [field]: field === 'sku' ? value.toUpperCase() : value
                };
                return updated;
            });
        },
        []
    );

    // ✅ Update variant images when attribute value images change
    useEffect(() => {
        if (Object.keys(attributeValueImages).length === 0) return;

        setVariantData((prev) =>
            prev.map((variant) => ({
                ...variant,
                images: applyAttributeValueImagesToVariant(variant.combination)
            }))
        );
    }, [attributeValueImages, applyAttributeValueImagesToVariant]);

    // ✅ Update variant data when color codes change
    useEffect(() => {
        setVariantData((prev) =>
            prev.map((variant) => ({
                ...variant,
                color_code: applyAttributeValueColorCodesToVariant(
                    variant.combination
                )
            }))
        );
    }, [
        attributeValueColorCodes,
        imageBasedOn,
        applyAttributeValueColorCodesToVariant
    ]);

    // ✅ Handler for attribute value image upload
    const handleAttributeValueImageUpload = useCallback(
        async (attrName: string, value: string, file: File) => {
            try {
                const response: any = await uploadMultipleFile([file]);

                if (response?.data?.success) {
                    const uploadedUrl = response?.data?.data?.urls[0];
                    if (uploadedUrl) {
                        setAttributeValueImages((prev) => {
                            const attrMap = prev[attrName] || {};
                            const valueImages = attrMap[value] || [];
                            return {
                                ...prev,
                                [attrName]: {
                                    ...attrMap,
                                    [value]: [...valueImages, uploadedUrl]
                                }
                            };
                        });
                        toast.success('Image uploaded successfully!');
                    }
                } else {
                    toast.error('Failed to upload image.');
                }
            } catch (error) {
                console.log('ATTRIBUTE VALUE IMAGE UPLOAD ERROR: ', error);
                toast.error('Something went wrong while uploading image.');
            }
        },
        [uploadMultipleFile]
    );

    // ✅ Handler for toggling slider image for attribute value
    const handleToggleSliderImageForAttributeValue = useCallback(
        (attrName: string, value: string, imageUrl: string) => {
            setAttributeValueImages((prev) => {
                const attrMap = prev[attrName] || {};
                const valueImages = attrMap[value] || [];
                const isAlreadySelected = valueImages.includes(imageUrl);

                if (isAlreadySelected) {
                    // Remove image
                    return {
                        ...prev,
                        [attrName]: {
                            ...attrMap,
                            [value]: valueImages.filter(
                                (url) => url !== imageUrl
                            )
                        }
                    };
                } else {
                    // Add image
                    return {
                        ...prev,
                        [attrName]: {
                            ...attrMap,
                            [value]: [...valueImages, imageUrl]
                        }
                    };
                }
            });
        },
        []
    );

    // ✅ Handler for removing image from attribute value
    const handleRemoveAttributeValueImage = useCallback(
        (attrName: string, value: string, imageUrl: string) => {
            setAttributeValueImages((prev) => {
                const attrMap = prev[attrName] || {};
                const valueImages = attrMap[value] || [];
                return {
                    ...prev,
                    [attrName]: {
                        ...attrMap,
                        [value]: valueImages.filter((url) => url !== imageUrl)
                    }
                };
            });
        },
        []
    );

    // ✅ Drag and drop handlers for reordering variant rows
    const handleRowDragStart = useCallback(
        (e: React.DragEvent, index: number) => {
            e.dataTransfer.setData('rowIndex', String(index));
        },
        []
    );

    const handleRowDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleRowDrop = useCallback(
        (e: React.DragEvent, targetIndex: number) => {
            e.preventDefault();
            const sourceIndex = parseInt(e.dataTransfer.getData('rowIndex'));

            if (sourceIndex === targetIndex) return;

            setVariantData((prev) => {
                const updated = [...prev];
                const [removed] = updated.splice(sourceIndex, 1);
                updated.splice(targetIndex, 0, removed);

                // Update serial numbers based on new positions
                return updated.map((variant, idx) => ({
                    ...variant,
                    serial: idx + 1
                }));
            });
        },
        []
    );

    // ✅ Update variant images when imageBasedOn changes
    useEffect(() => {
        setVariantData((prev) =>
            prev.map((variant) => ({
                ...variant,
                images: applyAttributeValueImagesToVariant(variant.combination),
                image_based_on: imageBasedOn || undefined
            }))
        );
    }, [imageBasedOn, applyAttributeValueImagesToVariant]);

    return (
        <div className='w-full space-y-4 rounded-lg rounded-t-lg border border-b bg-background px-4 py-2 shadow transition-transform duration-300 hover:shadow-xl lg:px-6'>
            <div className='flex flex-col items-center justify-between gap-y-1 md:flex-row'>
                <h2 className='text-base font-semibold md:text-xl'>
                    Update Product Attribute & Variant
                </h2>
                <Button
                    type='button'
                    variant='outline'
                    onClick={addAttribute}
                    disabled={attributes?.length >= 3}
                >
                    <Plus className='mr-2 h-4 w-4' /> Add Attribute
                </Button>
            </div>

            <div className='grid gap-6 xl:grid-cols-2'>
                {attributes?.map((attr, attrIndex) => (
                    <div
                        key={attrIndex}
                        className='space-y-4 rounded-lg border bg-gray-50 p-4'
                    >
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium'>
                                Attribute Name
                            </label>
                            <div className='flex items-center gap-2'>
                                <Input
                                    value={attr.name}
                                    onChange={(e) =>
                                        handleAttributeChange(
                                            attrIndex,
                                            e.target.value
                                        )
                                    }
                                    placeholder='e.g. Color'
                                />
                                <Button
                                    type='button'
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => removeAttribute(attrIndex)}
                                >
                                    <Trash className='h-4 w-4' />
                                </Button>
                            </div>
                            {/* ✅ Toggle switch for image-based-on */}
                            {attr.name.trim() && (
                                <div className='flex items-center gap-2 pt-1'>
                                    <Switch
                                        checked={imageBasedOn === attr.name}
                                        onCheckedChange={() =>
                                            handleToggleImageBasedOn(attr.name)
                                        }
                                    />
                                    <label
                                        className='cursor-pointer text-xs text-muted-foreground'
                                        htmlFor={`image-based-${attr.name}`}
                                    >
                                        Show Image by {attr.name}
                                    </label>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium'>
                                Values
                            </label>
                            <div className='flex flex-wrap gap-2'>
                                {attr?.values?.map((val, valIndex) => (
                                    <div
                                        key={valIndex}
                                        draggable
                                        onDragStart={(e) =>
                                            handleDragStart(
                                                e,
                                                attrIndex,
                                                valIndex
                                            )
                                        }
                                        onDragOver={handleDragOver}
                                        onDrop={(e) =>
                                            handleDrop(e, attrIndex, valIndex)
                                        }
                                        className='flex cursor-move items-center gap-1 rounded border bg-white px-2 py-1 transition-colors hover:bg-gray-50'
                                    >
                                        <GripVertical className='h-4 w-4 cursor-grab text-muted-foreground' />
                                        <Input
                                            className='w-20 border-none p-0 text-sm shadow-none focus-visible:ring-0'
                                            value={val}
                                            onChange={(e) =>
                                                handleValueChange(
                                                    attrIndex,
                                                    valIndex,
                                                    e.target.value
                                                )
                                            }
                                            placeholder='e.g. Red'
                                        />
                                        {/* ✅ Attribute Value Image Button - only show if this attribute is selected as image_based_on */}
                                        {val.trim() &&
                                            imageBasedOn === attr.name && (
                                                <AttributeValueImagesButton
                                                    attrName={attr.name}
                                                    value={val}
                                                    images={
                                                        attributeValueImages[
                                                            attr.name
                                                        ]?.[val] || []
                                                    }
                                                    sliderImages={sliderImages}
                                                    onUploadImage={(file) =>
                                                        handleAttributeValueImageUpload(
                                                            attr.name,
                                                            val,
                                                            file
                                                        )
                                                    }
                                                    onToggleImage={(url) =>
                                                        handleToggleSliderImageForAttributeValue(
                                                            attr.name,
                                                            val,
                                                            url
                                                        )
                                                    }
                                                    onRemoveImage={(url) =>
                                                        handleRemoveAttributeValueImage(
                                                            attr.name,
                                                            val,
                                                            url
                                                        )
                                                    }
                                                    isUploading={
                                                        isUploadingImage
                                                    }
                                                />
                                            )}
                                        {/* ✅ Color Code Input - only show if this attribute is selected as image_based_on */}
                                        {val.trim() &&
                                            imageBasedOn === attr.name && (
                                                <InlineColorPicker
                                                    value={
                                                        attributeValueColorCodes[
                                                            attr.name
                                                        ]?.[val] || ''
                                                    }
                                                    onChange={(color) =>
                                                        handleColorCodeChange(
                                                            attr.name,
                                                            val,
                                                            color
                                                        )
                                                    }
                                                    placeholder='#000000'
                                                    size='sm'
                                                />
                                            )}
                                        <button
                                            type='button'
                                            onClick={() =>
                                                removeValue(attrIndex, valIndex)
                                            }
                                        >
                                            <X className='h-4 w-4 text-muted-foreground' />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    size='sm'
                                    variant='secondary'
                                    onClick={() => addValue(attrIndex)}
                                >
                                    <Plus className='mr-1 h-4 w-4' /> Add
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {variantData?.length > 0 && (
                <div className='space-y-4'>
                    <h2 className='text-base font-semibold md:text-xl'>
                        Variant Matrix
                    </h2>

                    <div className='grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
                        <div>
                            <label className='mb-1 block text-sm font-medium'>
                                Default Regular Price (BDT)
                            </label>
                            <Input
                                type='number'
                                value={defaultRegular}
                                onChange={(e) =>
                                    setDefaultRegular(e.target.value)
                                }
                                placeholder='Enter default regular price'
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium'>
                                Default Sale Price (BDT)
                            </label>
                            <Input
                                type='number'
                                value={defaultSale}
                                onChange={(e) => setDefaultSale(e.target.value)}
                                placeholder='Enter default sale price'
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium'>
                                Root Level SKU
                            </label>
                            <Input
                                type='text'
                                value={rootLevelSKU}
                                className='uppercase disabled:bg-gray-100'
                                disabled
                                title='Root level SKU cannot be edited.'
                                onChange={(e) =>
                                    setRootLevelSKU &&
                                    setRootLevelSKU(
                                        e.target.value?.toUpperCase()
                                    )
                                }
                                placeholder='Enter root level SKU'
                            />
                        </div>

                        <div className='flex items-end'>
                            <Button
                                type='button'
                                onClick={handleApplyDefaultPricesAndSKUToAll}
                                className='w-full max-w-[150px]'
                            >
                                Apply to All
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serial</TableHead>
                                <TableHead>Attribute Variation</TableHead>
                                <TableHead>Regular Price</TableHead>
                                <TableHead>Sale Price</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Color Code</TableHead>
                                <TableHead>Images</TableHead>
                                <TableHead className='w-[120px]'>
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {variantData?.map((variant, index) => (
                                <TableRow
                                    key={
                                        variant._id
                                            ? String(variant._id)
                                            : `${index}-${makeSig(variant.combination)}`
                                    }
                                    draggable
                                    onDragStart={(e) =>
                                        handleRowDragStart(e, index)
                                    }
                                    onDragOver={handleRowDragOver}
                                    onDrop={(e) => handleRowDrop(e, index)}
                                    className='cursor-move hover:bg-muted/50'
                                >
                                    <TableCell className=''>
                                        <div className='flex items-center gap-2'>
                                            <GripVertical className='h-4 w-4 text-muted-foreground' />
                                            <span>
                                                {variant.serial ?? index + 1}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {Object.values(
                                            variant.combination
                                        ).join(' - ')}
                                    </TableCell>

                                    <TableCell>
                                        <Input
                                            type='number'
                                            value={variant.regular_price}
                                            onChange={(e) =>
                                                handleVariantInputChange(
                                                    index,
                                                    'regular_price',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Input
                                            type='number'
                                            value={variant.sale_price}
                                            onChange={(e) =>
                                                handleVariantInputChange(
                                                    index,
                                                    'sale_price',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </TableCell>

                                    <TableCell className='min-w-[250px]'>
                                        <Input
                                            value={variant.sku}
                                            onChange={(e) =>
                                                handleVariantInputChange(
                                                    index,
                                                    'sku',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {variant.color_code ? (
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='h-6 w-6 rounded border border-input shadow-sm'
                                                    style={{
                                                        backgroundColor:
                                                            variant.color_code
                                                    }}
                                                    title={variant.color_code}
                                                />
                                                <span className='text-xs text-muted-foreground'>
                                                    {variant.color_code}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className='text-xs text-muted-foreground'>
                                                -
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <VariantImagesDialog
                                            variantImages={variant.images || []}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {variant._id ? (
                                            <span className='rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
                                                EXISTING
                                            </span>
                                        ) : (
                                            <span className='rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'>
                                                NEW
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

// ✅ Attribute Value Images Button Component
interface AttributeValueImagesButtonProps {
    attrName: string;
    value: string;
    images: string[];
    sliderImages: string[];
    onUploadImage: (file: File) => Promise<void>;
    onToggleImage: (imageUrl: string) => void;
    onRemoveImage: (imageUrl: string) => void;
    isUploading?: boolean;
}

const AttributeValueImagesButton: React.FC<AttributeValueImagesButtonProps> = ({
    attrName,
    value,
    images,
    sliderImages,
    onUploadImage,
    onToggleImage,
    onRemoveImage,
    isUploading = false
}) => {
    const [open, setOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 3MB)
        const MAX_FILE_SIZE = 3 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image size must be less than 3MB');
            return;
        }

        await onUploadImage(file);
        // Reset input
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 3MB)
        const MAX_FILE_SIZE = 3 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image size must be less than 3MB');
            return;
        }

        await onUploadImage(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='relative h-6 w-6 p-0'
                >
                    {images.length > 0 ? (
                        <div className='relative h-full w-full'>
                            <Image
                                src={getImgFullUrl(images[0])}
                                alt={`${value} image`}
                                fill
                                className='rounded object-cover'
                            />
                            <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
                                {images.length}
                            </span>
                        </div>
                    ) : (
                        <ImagePlus className='h-3 w-3 text-muted-foreground' />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>
                        Manage Images for &quot;{attrName}: {value}&quot;
                    </DialogTitle>
                </DialogHeader>
                <div className='space-y-6'>
                    {/* Selected Images */}
                    <div>
                        <h3 className='mb-3 text-sm font-medium'>
                            Selected Images ({images.length})
                        </h3>
                        {images.length > 0 ? (
                            <div className='grid grid-cols-4 gap-3'>
                                {images.map((imageUrl, idx) => (
                                    <div
                                        key={idx}
                                        className='relative aspect-square'
                                    >
                                        <Image
                                            src={getImgFullUrl(imageUrl)}
                                            alt={`Selected ${idx + 1}`}
                                            fill
                                            className='rounded-md border object-cover'
                                        />
                                        <button
                                            type='button'
                                            onClick={() =>
                                                onRemoveImage(imageUrl)
                                            }
                                            className='text-destructive-foreground absolute top-1 right-1 rounded-full bg-destructive p-1 shadow-md'
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                        <span className='absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-xs text-white'>
                                            {idx + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                No images selected
                            </p>
                        )}
                    </div>

                    {/* Slider Images - Select from */}
                    {sliderImages.length > 0 && (
                        <div>
                            <h3 className='mb-3 text-sm font-medium'>
                                Select from Slider Images ({sliderImages.length}
                                )
                            </h3>
                            <div className='grid grid-cols-4 gap-3'>
                                {sliderImages.map((imageUrl, idx) => {
                                    const isSelected =
                                        images.includes(imageUrl);
                                    return (
                                        <button
                                            key={idx}
                                            type='button'
                                            onClick={() =>
                                                onToggleImage(imageUrl)
                                            }
                                            className={`relative aspect-square rounded-md border-2 transition-colors ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <Image
                                                src={getImgFullUrl(imageUrl)}
                                                alt={`Slider ${idx + 1}`}
                                                fill
                                                className='rounded-md object-cover'
                                            />
                                            <span className='absolute top-1 left-1 rounded bg-black/50 px-1.5 text-xs text-white'>
                                                {idx + 1}
                                            </span>
                                            {isSelected && (
                                                <div className='absolute top-1 right-1 rounded-full bg-primary p-1 text-primary-foreground'>
                                                    <X className='h-3 w-3' />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Upload New Image at Attribute Value Level */}
                    <div>
                        <h3 className='mb-3 text-sm font-medium'>
                            Upload New Image
                        </h3>
                        <input
                            type='file'
                            accept='image/*'
                            className='hidden'
                            id={`attr-value-upload-${attrName}-${value}`}
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        <div
                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <Button
                                type='button'
                                variant='outline'
                                className='w-full'
                                disabled={isUploading}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            `attr-value-upload-${attrName}-${value}`
                                        )
                                        ?.click()
                                }
                            >
                                {isUploading ? (
                                    <>
                                        <Loader className='mr-2 h-4 w-4 animate-spin' />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className='mr-2 h-4 w-4' />
                                        Upload New Image
                                    </>
                                )}
                            </Button>
                            <p className='mt-2 text-xs text-muted-foreground'>
                                or drag and drop (max 3MB)
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ✅ Variant Images Dialog Component (Editable)
interface VariantImagesDialogProps {
    variantImages: string[];
}

const VariantImagesDialog: React.FC<VariantImagesDialogProps> = ({
    variantImages
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='relative h-10 w-10 p-0'
                >
                    {variantImages.length > 0 ? (
                        <div className='relative h-full w-full'>
                            <Image
                                src={getImgFullUrl(variantImages[0])}
                                alt='Variant'
                                fill
                                className='rounded object-cover'
                            />
                            <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
                                {variantImages.length}
                            </span>
                        </div>
                    ) : (
                        <ImagePlus className='h-4 w-4' />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    {/* <DialogTitle>Manage Variant Images</DialogTitle> */}
                    {/* <p className='text-sm text-muted-foreground'>
      Add or remove images for this variant combination
     </p> */}
                </DialogHeader>
                <div className='space-y-6'>
                    {/* Selected Images */}
                    <div>
                        {/* <h3 className='text-sm font-medium mb-3'>
       Selected Images ({variantImages.length})
      </h3> */}
                        {variantImages.length > 0 ? (
                            <div className='grid grid-cols-4 gap-3'>
                                {variantImages.map((imageUrl, idx) => (
                                    <div
                                        key={idx}
                                        className='relative aspect-square'
                                    >
                                        <Image
                                            src={getImgFullUrl(imageUrl)}
                                            alt={`Selected ${idx + 1}`}
                                            fill
                                            className='rounded-md border object-cover'
                                        />
                                        {/* <button
           type='button'
           onClick={() => onRemoveImage(imageUrl)}
           className='absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md'>
           <X className='h-3 w-3' />
          </button> */}
                                        <span className='absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-xs text-white'>
                                            {idx + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                No images selected
                            </p>
                        )}
                    </div>

                    {/* Slider Images - Select from */}
                    {/* {sliderImages.length > 0 && (
      <div>
       <h3 className='text-sm font-medium mb-3'>
        Select from Slider Images ({sliderImages.length})
       </h3>
       <div className='grid grid-cols-4 gap-3'>
        {sliderImages.map((imageUrl, idx) => {
         const isSelected = variantImages.includes(imageUrl);
         return (
          <button
           key={idx}
           type='button'
           onClick={() => onToggleImage(imageUrl)}
           className={`relative aspect-square rounded-md border-2 transition-colors ${
            isSelected
             ? "border-primary bg-primary/10"
             : "border-border hover:border-primary/50"
           }`}>
           <Image
            src={getImgFullUrl(imageUrl)}
            alt={`Slider ${idx + 1}`}
            fill
            className='object-cover rounded-md'
           />
           <span className='absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 rounded'>
            {idx + 1}
           </span>
           {isSelected && (
            <div className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1'>
             <X className='h-3 w-3' />
            </div>
           )}
          </button>
         );
        })}
       </div>
      </div>
     )} */}

                    {/* Upload New Image at Variant Level */}
                    {/* <div>
      <h3 className="text-sm font-medium mb-3">Upload New Image</h3>
      <input
       type="file"
       accept="image/*"
       className="hidden"
       id={`variant-upload-${variantIndex}`}
       onChange={handleFileSelect}
       disabled={isUploading}
      />
      <div
       className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
         ? "border-primary bg-primary/5"
         : "border-border hover:border-primary/50"
       }`}
       onDrop={handleDrop}
       onDragOver={handleDragOver}
       onDragLeave={handleDragLeave}>
       <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading}
        onClick={() =>
         document.getElementById(`variant-upload-${variantIndex}`)?.click()
        }>
        {isUploading ? (
         <>
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Uploading...
         </>
        ) : (
         <>
          <ImagePlus className="h-4 w-4 mr-2" />
          Upload New Image
         </>
        )}
       </Button>
       <p className="text-xs text-muted-foreground mt-2">
        or drag and drop (max 3MB)
       </p>
      </div>
     </div> */}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AttributesAndVariantsUpdate;
