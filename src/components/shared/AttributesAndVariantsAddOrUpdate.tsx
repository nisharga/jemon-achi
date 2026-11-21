// "use client";
// import React, {
//  Dispatch,
//  useCallback,
//  useEffect,
//  useMemo,
//  useState,
// } from "react";
// import { Input } from "@/components/ui/admin-input";
// import { Button } from "@/components/ui/admin-button";
// import { Plus, Trash, X } from "lucide-react";
// import {
//  Table,
//  TableBody,
//  TableCell,
//  TableHead,
//  TableHeader,
//  TableRow,
// } from "@/components/ui/table";
// import debounce from "lodash/debounce";
// import {
//  defaultAttributesData,
//  defaultVariationData,
// } from "@/constants/defaultVariationData";

// interface Attribute {
//  name: string;
//  values: string[];
// }

// type VariantCombination = Record<string, string>;

// interface VariantData {
//  combination: VariantCombination;
//  sale_price: string;
//  regular_price: string;
//  //  available_quantity: string;
//  sku: string;
//  barcode?: string;
// }

// export type TAttributesAndVariantsData = {
//  attributes: string[];
//  variants: {
//   attribute_values: VariantCombination;
//   sale_price: number;
//   regular_price: number;
//   //   available_quantity: number;
//   sku: string;
//   barcode?: string;
//  }[];
// };

// type TAddVariantsProps = {
//  onChange: Dispatch<TAttributesAndVariantsData | null>;
//  defaultRegularPrice: string | number;
//  defaultSalePrice: string | number;
//  defaultValue?: TAttributesAndVariantsData | null;
//  rootLevelSKU?: string;
//  setRootLevelSKU?: Dispatch<React.SetStateAction<string>>;
// };

// const AttributesAndVariantsAddOrUpdate: React.FC<TAddVariantsProps> = ({
//  onChange,
//  defaultRegularPrice,
//  defaultSalePrice,
//  defaultValue,
//  rootLevelSKU,
//  setRootLevelSKU,
// }) => {
//  const [attributes, setAttributes] = useState<Attribute[]>([
//   ...defaultAttributesData,
//  ]);
//  const [variantData, setVariantData] = useState<VariantData[]>([
//   ...defaultVariationData,
//  ]);
//  const [defaultSale, setDefaultSale] = useState(String(defaultSalePrice));
//  const [defaultRegular, setDefaultRegular] = useState(
//   String(defaultRegularPrice),
//  );

//  // Memoize attributeMap to prevent recomputing unnecessarily
//  const attributeMap = useMemo(() => {
//   const map: Record<string, string[]> = {};
//   attributes?.forEach((attr) => {
//    if (attr?.name && attr.values?.length) {
//     map[attr?.name] = attr.values?.filter(Boolean);
//    }
//   });
//   return map;
//  }, [attributes]);

//  // Memoize variant combinations generation
//  const variantCombinations = useMemo(() => {
//   const keys = Object.keys(attributeMap);

//   const combine = (
//    index = 0,
//    current: VariantCombination = {},
//   ): VariantCombination[] => {
//    if (index === keys?.length) return [current];
//    const key = keys[index];
//    const values = attributeMap[key];
//    const combinations: VariantCombination[] = [];

//    for (const value of values) {
//     combinations.push(...combine(index + 1, { ...current, [key]: value }));
//    }

//    return combinations;
//   };

//   return combine();
//  }, [attributeMap]);

//  //  type Combo = Record<string, string | number>;

//  //  type SkuOptions = {
//  //   primaryAttrName?: string; // e.g., "Size"
//  //   customOrders?: Record<string, string[]>; // e.g., { Size: ["XS","S","M","L","XL","XXL"] }
//  //   valueCodes?: Record<string, Record<string, string>>; // e.g., { Color: { Black: "B" } }
//  //  };

//  const handleApplyDefaultPricesAndSKUToAll = () => {
//   setVariantData((prev) => {
//    // === 1️⃣ collect all attribute values keeping input order ===
//    const attributeOrders = new Map<string, string[]>();

//    // ধরো প্রতিটা variant combination থেকে attribute মানগুলো বের করা
//    for (const variant of prev) {
//     const comb = variant.combination || {};
//     for (const [attr, rawVal] of Object.entries(comb)) {
//      const val = String(rawVal);
//      if (!attributeOrders.has(attr)) attributeOrders.set(attr, []);
//      const arr = attributeOrders.get(attr)!;
//      if (!arr.includes(val)) arr.push(val); // preserve first-seen order
//     }
//    }

//    // === 2️⃣ determine primary attribute (prefer “Size”) ===
//    const primary =
//     Array.from(attributeOrders.keys()).find((a) => /size/i.test(a)) ||
//     Array.from(attributeOrders.keys())[0];

//    // make index map from order of appearance (S=1, M=2, L=3 …)
//    const orderList = attributeOrders.get(primary) || [];
//    const primaryIndexMap = new Map<string, number>(
//     orderList.map((v, i) => [v, i + 1]),
//    );

//    // === 3️⃣ helper to get initials for non-primary attributes ===
//    const getTokenPart = (comb: Record<string, string | number>) => {
//     return (
//      Object.entries(comb)
//       .filter(([k]) => k !== primary)
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       .map(([_, v]) => String(v).charAt(0).toUpperCase())
//       .join("")
//     );
//    };

//    // === 4️⃣ build each SKU ===
//    return prev.map((variant) => {
//     const comb = variant.combination || {};
//     const root = rootLevelSKU || "";

//     const primaryVal = comb[primary] ? String(comb[primary]) : "";
//     const idx = primaryIndexMap.get(primaryVal) || 0;
//     const attrPart = getTokenPart(comb);

//     const generatedSKU = root + attrPart + (idx ? `-${idx}` : "");

//     return {
//      ...variant,
//      sale_price: defaultSale,
//      regular_price: defaultRegular,
//      sku:
//       variant.sku && variant.sku !== "" && variant.sku !== rootLevelSKU
//        ? variant.sku
//        : generatedSKU,
//     };
//    });
//   });
//  };

//  useEffect(() => {
//   setDefaultSale(String(defaultSalePrice));
//   setDefaultRegular(String(defaultRegularPrice));
//  }, [defaultRegularPrice, defaultSalePrice]);

//  // test purpose it will be removed later
//  // // update price when variantCombinations, defaultSale, or defaultRegular changes
//  // useEffect(() => {
//  //     const updatedData: VariantData[] = variantCombinations.map((combo) => {
//  //         const existing = variantData?.find(
//  //             (v) => JSON.stringify(v.combination) === JSON.stringify(combo)
//  //         );
//  //         return (
//  //             existing || {
//  //                 combination: combo,
//  //                 sale_price: defaultSale,
//  //                 regular_price: defaultRegular,
//  //                 available_quantity: "0",
//  //                 sku: "",
//  //                 barcode: "",
//  //             }
//  //         );
//  //     });
//  //     setVariantData(updatedData);
//  // }, [variantCombinations, defaultSale, defaultRegular]);

//  // Update variantData when combinations, defaultPrice, or defaultDiscountAmount changes
//  useEffect(() => {
//   const updatedData: VariantData[] = variantCombinations.map((combo) => {
//    const existing = variantData?.find(
//     (v) => JSON.stringify(v.combination) === JSON.stringify(combo),
//    );
//    return (
//     existing || {
//      combination: combo,
//      sale_price: String(defaultSale),
//      regular_price: String(defaultRegular),
//      available_quantity: "0",
//      sku: "",
//      barcode: "",
//     }
//    );
//   });

//   setVariantData(updatedData);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//  }, [variantCombinations, defaultSale, defaultRegular]);

//  useEffect(() => {
//   if (!defaultValue) {
//    setAttributes([...defaultAttributesData]);
//    setVariantData([...defaultVariationData]);
//    return;
//   }

//   const uniqueAttributes: Attribute[] = defaultValue.attributes.map(
//    (attrName) => {
//     const values = Array.from(
//      new Set(defaultValue.variants.map((v) => v.attribute_values[attrName])),
//     );
//     return { name: attrName, values };
//    },
//   );

//   const mappedVariants: VariantData[] = defaultValue.variants.map((v) => ({
//    combination: v.attribute_values,
//    sale_price: String(v.sale_price ?? defaultSalePrice),
//    regular_price: String(v.regular_price ?? defaultRegularPrice),
//    sku: v.sku ?? "",
//    barcode: v.barcode ?? "",
//   }));

//   setAttributes(uniqueAttributes);
//   setVariantData(mappedVariants);
//   // run ONCE only
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//  }, []);

//  // Debounced onChange to limit calls
//  const debouncedOnChange = useMemo(
//   () =>
//    debounce((attrs: Attribute[], variants: VariantData[]) => {
//     if (attrs?.length !== 0 && attrs[0].name !== "") {
//      const formatted = {
//       attributes: attrs?.map((a) => a.name),
//       variants: variants?.map(
//        ({
//         combination,
//         sale_price,
//         regular_price,
//         // available_quantity,
//         sku,
//        }) => ({
//         attribute_values: combination,
//         sale_price: Number(sale_price),
//         regular_price: Number(regular_price),
//         // available_quantity: Number(available_quantity),
//         sku,
//         barcode: "",
//        }),
//       ),
//      };
//      onChange(formatted);
//     } else {
//      onChange(null);
//     }
//    }, 300),
//   [onChange],
//  );

//  // Call debounced onChange when attributes or variantData changes
//  useEffect(() => {
//   debouncedOnChange(attributes, variantData);
//  }, [attributes, variantData, debouncedOnChange]);

//  // Handlers - memoized for performance
//  const handleAttributeChange = useCallback((index: number, value: string) => {
//   setAttributes((prev) => {
//    const newAttributes = [...prev];
//    newAttributes[index] = { ...newAttributes[index], name: value };
//    return newAttributes;
//   });
//  }, []);

//  const handleValueChange = useCallback(
//   (attrIndex: number, valIndex: number, value: string) => {
//    setAttributes((prev) => {
//     const newAttributes = [...prev];
//     const newValues = [...newAttributes[attrIndex].values];
//     newValues[valIndex] = value;
//     newAttributes[attrIndex] = {
//      ...newAttributes[attrIndex],
//      values: newValues,
//     };
//     return newAttributes;
//    });
//   },
//   [],
//  );

//  const addAttribute = useCallback(() => {
//   setAttributes((prev) => {
//    if (prev?.length >= 2) return prev;
//    return [...prev, { name: "", values: [""] }];
//   });
//  }, []);

//  const removeAttribute = useCallback((index: number) => {
//   setAttributes((prev) => prev.filter((_, i) => i !== index));
//  }, []);

//  const addValue = useCallback((index: number) => {
//   setAttributes((prev) => {
//    const newAttributes = [...prev];
//    newAttributes[index] = {
//     ...newAttributes[index],
//     values: [...newAttributes[index].values, ""],
//    };
//    return newAttributes;
//   });
//  }, []);

//  const removeValue = useCallback((attrIndex: number, valIndex: number) => {
//   setAttributes((prev) => {
//    const newAttributes = [...prev];
//    const newValues = [...newAttributes[attrIndex].values];
//    newValues.splice(valIndex, 1);
//    newAttributes[attrIndex] = {
//     ...newAttributes[attrIndex],
//     values: newValues,
//    };
//    return newAttributes;
//   });
//  }, []);

//  const handleVariantInputChange = useCallback(
//   (
//    index: number,
//    field: keyof Omit<VariantData, "combination">,
//    value: string,
//   ) => {
//    setVariantData((prev) => {
//     const updated = [...prev];
//     updated[index] = {
//      ...updated[index],
//      [field]: field === "sku" ? value.toUpperCase() : value,
//     };
//     return updated;
//    });
//   },
//   [],
//  );

//  return (
//   <div className='space-y-4 bg-background rounded-lg shadow hover:shadow-xl transition-transform duration-300 border border-b rounded-t-lg w-full px-4 lg:px-6 py-2'>
//    <div className='flex justify-between items-center'>
//     <h2 className='text-xl font-semibold'>
//      {defaultValue
//       ? "Update Product Attribute & Variant"
//       : "Add Product Attribute & Variant"}
//     </h2>
//     <Button
//      type='button'
//      variant='outline'
//      onClick={addAttribute}
//      disabled={attributes?.length >= 2}>
//      <Plus className='w-4 h-4 mr-2' /> Add Attribute
//     </Button>
//    </div>

//    <div className='grid xl:grid-cols-2 gap-6 '>
//     {attributes?.map((attr, attrIndex) => (
//      <div
//       key={attrIndex}
//       className='border p-4 rounded-lg space-y-4 bg-gray-50'>
//       <div className='space-y-2'>
//        <label className='block text-sm font-medium'>Attribute Name</label>
//        <div className='flex items-center gap-2'>
//         <Input
//          value={attr.name}
//          onChange={(e) => handleAttributeChange(attrIndex, e.target.value)}
//          placeholder='e.g. Color'
//         />
//         <Button
//          type='button'
//          variant='destructive'
//          size='icon'
//          onClick={() => removeAttribute(attrIndex)}>
//          <Trash className='w-4 h-4' />
//         </Button>
//        </div>
//       </div>
//       <div>
//        <label className='block text-sm font-medium mb-1'>Values</label>
//        <div className='flex flex-wrap gap-2'>
//         {attr?.values?.map((val, valIndex) => (
//          <div
//           key={valIndex}
//           className='flex items-center gap-1 bg-white rounded px-2 py-1 border'>
//           <Input
//            className='w-20 border-none shadow-none p-0 text-sm focus-visible:ring-0'
//            value={val}
//            onChange={(e) =>
//             handleValueChange(attrIndex, valIndex, e.target.value)
//            }
//            placeholder='e.g. Red'
//           />
//           <button
//            type='button'
//            onClick={() => removeValue(attrIndex, valIndex)}>
//            <X className='h-4 w-4 text-muted-foreground' />
//           </button>
//          </div>
//         ))}
//         <Button
//          type='button'
//          size='sm'
//          variant='secondary'
//          onClick={() => addValue(attrIndex)}>
//          <Plus className='w-4 h-4 mr-1' /> Add
//         </Button>
//        </div>
//       </div>
//      </div>
//     ))}
//    </div>

//    {variantData?.length > 0 && (
//     <div className='space-y-4'>
//      <h2 className='text-xl font-semibold'>Variant Matrix</h2>
//      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl'>
//       <div>
//        <label className='block text-sm font-medium mb-1'>
//         Default Regular Price (BDT)
//        </label>
//        <Input
//         type='number'
//         value={defaultRegular}
//         onChange={(e) => setDefaultRegular(e.target.value)}
//         placeholder='Enter default regular price'
//        />
//       </div>
//       <div>
//        <label className='block text-sm font-medium mb-1'>
//         Default Sale Price (BDT)
//        </label>
//        <Input
//         type='number'
//         value={defaultSale}
//         onChange={(e) => setDefaultSale(e.target.value)}
//         placeholder='Enter default sale price'
//        />
//       </div>
//       <div>
//        <label className='block text-sm font-medium mb-1'>Root Level SKU</label>
//        <Input
//         type='text'
//         value={rootLevelSKU}
//         className='uppercase'
//         onChange={(e) =>
//          setRootLevelSKU && setRootLevelSKU(e.target.value?.toUpperCase())
//         }
//         placeholder='Enter root level SKU'
//        />
//       </div>

//       <div className='flex items-end'>
//        <Button
//         type='button'
//         onClick={() => handleApplyDefaultPricesAndSKUToAll()}
//         className='w-full max-w-[150px]'>
//         Apply to All
//        </Button>
//       </div>
//      </div>

//      <Table>
//       <TableHeader>
//        <TableRow>
//         <TableHead>SL</TableHead>
//         <TableHead>Attribute Variation</TableHead>
//         <TableHead>Regular Price</TableHead>
//         <TableHead>Sale Price</TableHead>
//         <TableHead>SKU</TableHead>
//         {/* <TableHead>Stock</TableHead> */}
//        </TableRow>
//       </TableHeader>
//       <TableBody>
//        {variantData?.map((variant, index) => (
//         <TableRow key={index}>
//          <TableCell>{index + 1}</TableCell>
//          <TableCell>{Object.values(variant.combination).join(" - ")}</TableCell>
//          <TableCell>
//           <Input
//            type='number'
//            value={variant.regular_price}
//            onChange={(e) =>
//             handleVariantInputChange(index, "regular_price", e.target.value)
//            }
//           />
//          </TableCell>
//          <TableCell>
//           <Input
//            type='number'
//            value={variant.sale_price}
//            onChange={(e) =>
//             handleVariantInputChange(index, "sale_price", e.target.value)
//            }
//           />
//          </TableCell>
//          <TableCell>
//           <Input
//            value={variant.sku}
//            onChange={(e) =>
//             handleVariantInputChange(index, "sku", e.target.value)
//            }
//           />
//          </TableCell>
//          {/* <TableCell>
//           <Input
//            type='number'
//            value={variant.available_quantity}
//            onChange={(e) =>
//             handleVariantInputChange(
//              index,
//              "available_quantity",
//              e.target.value,
//             )
//            }
//           />
//          </TableCell> */}
//         </TableRow>
//        ))}
//       </TableBody>
//      </Table>
//     </div>
//    )}
//   </div>
//  );
// };

// export default AttributesAndVariantsAddOrUpdate;

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
import { Plus, Trash, X, ImagePlus } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
// import {
//  Select,
//  SelectContent,
//  SelectItem,
//  SelectTrigger,
//  SelectValue,
// } from "@/components/ui/select";
import debounce from 'lodash/debounce';
import {
    defaultAttributesData,
    defaultVariationData
} from '@/constants/defaultVariationData';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
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
    combination: VariantCombination;
    sale_price: string;
    regular_price: string;
    sku: string;
    barcode?: string;
    discount_type?: 'FLAT' | 'PERCENTAGE';
    discount_value?: string;
    images?: string[]; // ✅ variant-specific images
    image_based_on?: string; // ✅ which attribute's images to use
    color_code?: string; // ✅ hex color code for this variant
}

export type TAttributesAndVariantsData = {
    attributes: string[];
    variants: {
        attribute_values: VariantCombination;
        sale_price: number;
        regular_price: number;
        sku: string;
        barcode?: string;
        discount_type?: 'FLAT' | 'PERCENTAGE';
        discount_value?: number;
        images?: string[]; // ✅ variant images
        image_based_on?: string; // ✅ which attribute's images to use
        color_code?: string; // ✅ hex color code for this variant
    }[];
};

type TAddVariantsProps = {
    onChange: Dispatch<TAttributesAndVariantsData | null>;
    defaultRegularPrice: string | number;
    defaultSalePrice: string | number;
    defaultValue?: TAttributesAndVariantsData | null;
    rootLevelSKU?: string;
    setRootLevelSKU?: Dispatch<React.SetStateAction<string>>;
    sliderImages?: string[]; // ✅ pre-uploaded slider URLs from parent
};

const AttributesAndVariantsAddOrUpdate: React.FC<TAddVariantsProps> = ({
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

    //  const [defaultDiscountType, setDefaultDiscountType] = useState<
    //   "FLAT" | "PERCENTAGE"
    //  >("FLAT");
    //  const [defaultDiscountValue, setDefaultDiscountValue] = useState("0");

    const attributeMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        attributes?.forEach((attr) => {
            if (attr?.name && attr.values?.length) {
                map[attr?.name] = attr.values?.filter(Boolean);
            }
        });
        return map;
    }, [attributes]);

    const variantCombinations = useMemo(() => {
        const keys = Object.keys(attributeMap);

        const combine = (
            index = 0,
            current: VariantCombination = {}
        ): VariantCombination[] => {
            if (index === keys?.length) return [current];
            const key = keys[index];
            const values = attributeMap[key];
            const combinations: VariantCombination[] = [];

            for (const value of values) {
                combinations.push(
                    ...combine(index + 1, { ...current, [key]: value })
                );
            }

            return combinations;
        };

        return combine();
    }, [attributeMap]);

    const handleApplyDefaultPricesAndSKUToAll = () => {
        setVariantData((prev) =>
            prev.map((variant) => {
                const root = (rootLevelSKU || '').trim().toUpperCase();

                // ✅ Support both structures
                const attributes =
                    (variant as any).combination ||
                    (variant as any).attribute_values ||
                    {};

                // ✅ Keep consistent attribute order
                const orderedValues = Object.keys(attributes)
                    .sort() // ensures Storage before Color (stable order)
                    .map((key) =>
                        attributes[key]
                            ?.toString()
                            .trim()
                            .replace(/\s+/g, '') // remove internal spaces if needed
                            .toUpperCase()
                    )
                    .filter(Boolean);

                const generatedSKU =
                    orderedValues.length > 0
                        ? `${root}-${orderedValues.join('-')}`
                        : root;

                return {
                    ...variant,
                    sale_price: defaultSale,
                    regular_price: defaultRegular,
                    sku:
                        variant.sku && variant.sku !== rootLevelSKU
                            ? variant.sku // keep manual SKU
                            : generatedSKU
                };
            })
        );
    };
    //  const handleApplyDefaultPricesAndSKUToAll = async () => {
    //   await rootSkuRefetch();
    //   console.log("root value inside", rootLevelSKU);
    //   setVariantData((prev) => {
    //    const attributeOrders = new Map<string, string[]>();

    //    for (const variant of prev) {
    //     const comb = variant.combination || {};
    //     for (const [attr, rawVal] of Object.entries(comb)) {
    //      const val = String(rawVal);
    //      if (!attributeOrders.has(attr)) attributeOrders.set(attr, []);
    //      const arr = attributeOrders.get(attr)!;
    //      if (!arr.includes(val)) arr.push(val);
    //     }
    //    }

    //    const primary =
    //     Array.from(attributeOrders.keys()).find((a) => /size/i.test(a)) ||
    //     Array.from(attributeOrders.keys())[0];

    //    const orderList = attributeOrders.get(primary) || [];
    //    const primaryIndexMap = new Map<string, number>(
    //     orderList.map((v, i) => [v, i + 1]),
    //    );

    //    const getTokenPart = (comb: Record<string, string | number>) => {
    //     return Object.entries(comb)
    //      .filter(([k]) => k !== primary)
    //      .map(([, v]) => String(v).charAt(0).toUpperCase())
    //      .join("");
    //    };

    //    return prev.map((variant) => {
    //     const comb = variant.combination || {};
    //     const root = rootLevelSKU || "";

    //     const primaryVal = comb[primary] ? String(comb[primary]) : "";
    //     const idx = primaryIndexMap.get(primaryVal) || 0;
    //     const attrPart = getTokenPart(comb);

    //     const generatedSKU = root + attrPart + (idx ? `-${idx}` : "");

    //     return {
    //      ...variant,
    //      sale_price: defaultSale,
    //      regular_price: defaultRegular,
    //      //  discount_type: defaultDiscountType,
    //      //  discount_value: defaultDiscountValue,
    //      sku:
    //       variant.sku && variant.sku !== "" && variant.sku !== rootLevelSKU
    //        ? variant.sku
    //        : generatedSKU,
    //     };
    //    });
    //   });
    //  };

    useEffect(() => {
        setDefaultSale(String(defaultSalePrice));
        setDefaultRegular(String(defaultRegularPrice));
    }, [defaultRegularPrice, defaultSalePrice]);

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

    useEffect(() => {
        const updatedData: VariantData[] = variantCombinations.map((combo) => {
            const existing = variantData?.find(
                (v) => JSON.stringify(v.combination) === JSON.stringify(combo)
            );
            // ✅ Apply attribute value images to variant
            const appliedImages = applyAttributeValueImagesToVariant(combo);
            // ✅ Apply attribute value color codes to variant
            const appliedColorCode =
                applyAttributeValueColorCodesToVariant(combo);
            return (
                existing || {
                    combination: combo,
                    sale_price: String(defaultSale),
                    regular_price: String(defaultRegular),
                    sku: '',
                    barcode: '',
                    discount_type: 'FLAT',
                    discount_value: '0',
                    images: appliedImages, // ✅ images from attribute values
                    color_code: appliedColorCode // ✅ color code from attribute values
                }
            );
        });

        // ✅ Update existing variants with attribute value images too
        const updatedWithImages = updatedData.map((variant) => ({
            ...variant,
            images: applyAttributeValueImagesToVariant(variant.combination),
            color_code: applyAttributeValueColorCodesToVariant(
                variant.combination
            )
        }));

        setVariantData(updatedWithImages);
    }, [
        variantCombinations,
        defaultSale,
        defaultRegular,
        applyAttributeValueImagesToVariant,
        applyAttributeValueColorCodesToVariant
    ]);

    useEffect(() => {
        if (!defaultValue) {
            setAttributes([...defaultAttributesData]);
            setVariantData([...defaultVariationData]);
            return;
        }

        const uniqueAttributes: Attribute[] = defaultValue.attributes.map(
            (attrName) => {
                const values = Array.from(
                    new Set(
                        defaultValue.variants.map(
                            (v) => v.attribute_values[attrName]
                        )
                    )
                );
                return { name: attrName, values };
            }
        );

        const mappedVariants: VariantData[] = defaultValue.variants.map(
            (v) => ({
                combination: v.attribute_values,
                sale_price: String(v.sale_price ?? defaultSalePrice),
                regular_price: String(v.regular_price ?? defaultRegularPrice),
                sku: v.sku ?? '',
                barcode: v.barcode ?? '',
                discount_type: v.discount_type ?? 'FLAT',
                discount_value: String(v.discount_value ?? 0),
                images: v.images || [], // ✅ variant images
                image_based_on: v?.image_based_on, // ✅ include image_based_on
                color_code: v?.color_code // ✅ include color_code
            })
        );

        setAttributes(uniqueAttributes);
        setVariantData(mappedVariants);

        // ✅ Set imageBasedOn from existing variant data if available
        const firstVariantWithImageBasedOn = defaultValue.variants?.find(
            (v: any) => v?.image_based_on
        );
        if (firstVariantWithImageBasedOn?.image_based_on) {
            setImageBasedOn(firstVariantWithImageBasedOn.image_based_on);
        }

        // ✅ Populate attributeValueColorCodes from existing variants
        const initialAttributeValueColorCodes: AttributeValueColorCodesMap = {};
        const imageBasedOnAttr = firstVariantWithImageBasedOn?.image_based_on;

        if (imageBasedOnAttr) {
            defaultValue.variants.forEach((variant: any) => {
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
    }, []);

    const debouncedOnChange = useMemo(
        () =>
            debounce((attrs: Attribute[], variants: VariantData[]) => {
                if (attrs?.length !== 0 && attrs[0].name !== '') {
                    const formatted = {
                        attributes: attrs?.map((a) => a.name),
                        variants: variants?.map(
                            ({
                                combination,
                                sale_price,
                                regular_price,
                                sku,
                                discount_type,
                                discount_value,
                                images,
                                image_based_on,
                                color_code
                            }) => ({
                                attribute_values: combination,
                                sale_price: Number(sale_price),
                                regular_price: Number(regular_price),
                                sku,
                                barcode: '',
                                discount_type,
                                discount_value: Number(discount_value),
                                images: images || [], // ✅ include images
                                image_based_on, // ✅ include image_based_on
                                color_code // ✅ include color_code
                            })
                        )
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
            if (prev?.length >= 2) return prev;
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

    // ✅ Update variant data when imageBasedOn changes
    useEffect(() => {
        setVariantData((prev) =>
            prev.map((variant) => ({
                ...variant,
                images: applyAttributeValueImagesToVariant(variant.combination),
                image_based_on: imageBasedOn || undefined
            }))
        );
    }, [imageBasedOn, applyAttributeValueImagesToVariant]);

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

    // ✅ Handlers for variant-level image operations
    const handleToggleImageFromSlider = useCallback(
        (variantIndex: number, imageUrl: string) => {
            setVariantData((prev) => {
                const updated = [...prev];
                const currentImages = updated[variantIndex].images || [];
                const isAlreadySelected = currentImages.includes(imageUrl);

                if (isAlreadySelected) {
                    // Remove image
                    updated[variantIndex] = {
                        ...updated[variantIndex],
                        images: currentImages.filter((url) => url !== imageUrl)
                    };
                } else {
                    // Add image
                    updated[variantIndex] = {
                        ...updated[variantIndex],
                        images: [...currentImages, imageUrl]
                    };
                }
                return updated;
            });
        },
        []
    );

    const handleRemoveVariantImage = useCallback(
        (variantIndex: number, imageUrl: string) => {
            setVariantData((prev) => {
                const updated = [...prev];
                const currentImages = updated[variantIndex].images || [];
                updated[variantIndex] = {
                    ...updated[variantIndex],
                    images: currentImages.filter((url) => url !== imageUrl)
                };
                return updated;
            });
        },
        []
    );

    const handleUploadVariantImage = useCallback(
        async (variantIndex: number, file: File) => {
            try {
                const response: any = await uploadMultipleFile({
                    files: [file]
                });

                if (response?.data?.success) {
                    const uploadedUrl = response?.data?.data?.urls[0];
                    if (uploadedUrl) {
                        setVariantData((prev) => {
                            const updated = [...prev];
                            const currentImages =
                                updated[variantIndex].images || [];
                            updated[variantIndex] = {
                                ...updated[variantIndex],
                                images: [...currentImages, uploadedUrl]
                            };
                            return updated;
                        });
                        toast.success('Image uploaded successfully!');
                    }
                } else {
                    toast.error('Failed to upload image.');
                }
            } catch (error) {
                console.log('VARIANT IMAGE UPLOAD ERROR: ', error);
                toast.error('Something went wrong while uploading image.');
            }
        },
        [uploadMultipleFile]
    );

    //  const handleVariantDiscountTypeChange = useCallback(
    //   (index: number, value: "FLAT" | "PERCENTAGE") => {
    //    setVariantData((prev) => {
    //     const updated = [...prev];
    //     updated[index] = {
    //      ...updated[index],
    //      discount_type: value,
    //     };
    //     return updated;
    //    });
    //   },
    //   [],
    //  );

    return (
        <div className='w-full space-y-4 rounded-lg rounded-t-lg border border-b bg-background px-4 py-2 shadow transition-transform duration-300 hover:shadow-xl lg:px-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>
                    {defaultValue
                        ? 'Update Product Attribute & Variant'
                        : 'Add Product Attribute & Variant'}
                </h2>
                <Button
                    type='button'
                    variant='outline'
                    onClick={addAttribute}
                    disabled={attributes?.length >= 2}
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
                                        className='flex items-center gap-1 rounded border bg-white px-2 py-1'
                                    >
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
                    <h2 className='text-xl font-semibold'>Variant Matrix</h2>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'>
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
                                className='uppercase'
                                onChange={(e) =>
                                    setRootLevelSKU &&
                                    setRootLevelSKU(
                                        e.target.value?.toUpperCase()
                                    )
                                }
                                placeholder='Enter root level SKU'
                            />
                        </div>
                    </div>

                    <div className='flex items-center'>
                        <Button
                            type='button'
                            onClick={() =>
                                handleApplyDefaultPricesAndSKUToAll()
                            }
                            className='w-full max-w-[200px] disabled:cursor-not-allowed'
                        >
                            Apply Defaults to All
                        </Button>
                    </div>

                    <div className='overflow-x-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Attribute Variation</TableHead>
                                    <TableHead>Regular Price</TableHead>
                                    <TableHead>Sale Price</TableHead>
                                    {/* <TableHead>Discount Type</TableHead>
         <TableHead>Discount Value</TableHead> */}
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Color Code</TableHead>
                                    <TableHead>Images</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variantData?.map((variant, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='whitespace-nowrap'>
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
                                                className='w-full min-w-28'
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
                                                className='w-full min-w-28'
                                            />
                                        </TableCell>
                                        {/* <TableCell>
           <Select
            value={variant.discount_type || "FLAT"}
            onValueChange={(value: "FLAT" | "PERCENTAGE") =>
             handleVariantDiscountTypeChange(index, value)
            }>
            <SelectTrigger className='w-full'>
             <SelectValue />
            </SelectTrigger>
            <SelectContent>
             <SelectItem value='FLAT'>Flat</SelectItem>
             <SelectItem value='PERCENTAGE'>Percentage</SelectItem>
            </SelectContent>
           </Select>
          </TableCell>
          <TableCell>
           <Input
            type='number'
            value={variant.discount_value || "0"}
            onChange={(e) =>
             handleVariantInputChange(index, "discount_value", e.target.value)
            }
            className='w-full min-w-28'
           />
          </TableCell> */}
                                        <TableCell>
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) =>
                                                    handleVariantInputChange(
                                                        index,
                                                        'sku',
                                                        e.target.value
                                                    )
                                                }
                                                className='w-full min-w-28'
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
                                                        title={
                                                            variant.color_code
                                                        }
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
                                                variantIndex={index}
                                                variantImages={
                                                    variant.images || []
                                                }
                                                sliderImages={sliderImages}
                                                onToggleImage={(url) =>
                                                    handleToggleImageFromSlider(
                                                        index,
                                                        url
                                                    )
                                                }
                                                onRemoveImage={(url) =>
                                                    handleRemoveVariantImage(
                                                        index,
                                                        url
                                                    )
                                                }
                                                onUploadImage={(file) =>
                                                    handleUploadVariantImage(
                                                        index,
                                                        file
                                                    )
                                                }
                                                isUploading={isUploadingImage}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttributesAndVariantsAddOrUpdate;

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
    variantIndex: number;
    variantImages: string[];
    sliderImages: string[];
    onToggleImage: (imageUrl: string) => void;
    onRemoveImage: (imageUrl: string) => void;
    onUploadImage: (file: File) => Promise<void>;
    isUploading?: boolean;
}

const VariantImagesDialog: React.FC<VariantImagesDialogProps> = ({
    variantIndex,
    variantImages,
    sliderImages,
    onToggleImage,
    onRemoveImage,
    onUploadImage,
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
                    <DialogTitle>Manage Variant Images</DialogTitle>
                    <p className='text-sm text-muted-foreground'>
                        Add or remove images for this variant combination
                    </p>
                </DialogHeader>
                <div className='space-y-6'>
                    {/* Selected Images */}
                    <div>
                        <h3 className='mb-3 text-sm font-medium'>
                            Selected Images ({variantImages.length})
                        </h3>
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
                                        variantImages.includes(imageUrl);
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

                    {/* Upload New Image at Variant Level */}
                    <div>
                        <h3 className='mb-3 text-sm font-medium'>
                            Upload New Image
                        </h3>
                        <input
                            type='file'
                            accept='image/*'
                            className='hidden'
                            id={`variant-upload-${variantIndex}`}
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
                                            `variant-upload-${variantIndex}`
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
