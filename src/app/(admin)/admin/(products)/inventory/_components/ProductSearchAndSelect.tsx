/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useGetAllProductsQuery } from '@/admin/redux/api-queries/product-api';
import { TProduct } from '@/admin/types/product';
import { useSearchParams } from 'next/navigation';
import React, {
    Dispatch,
    FC,
    SetStateAction,
    useEffect,
    useState
} from 'react';
import Popup from 'react-popupkit';

import { Input } from '@/admin/components/ui/input';
import { Card } from '@/admin/components/ui/card';
import { Skeleton } from '@/admin/components/ui/skeleton';
import Image from 'next/image';
import { getImgFullUrl } from '@/admin/lib/utils';

type TProps = {
    setSelectedProduct: Dispatch<SetStateAction<TProduct | null>>;
};

const ProductSearchAndSelect: FC<TProps> = ({ setSelectedProduct }) => {
    const searchParams = useSearchParams();
    const product_id = searchParams.get('product_id');
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<TProduct | null>(null);

    const {
        data: productsData,
        isLoading,
        isFetching
    } = useGetAllProductsQuery(
        { searchQuery: searchTerm, id: product_id, sku: '' },
        { refetchOnMountOrArgChange: true }
    );

    const products: TProduct[] = productsData?.data?.data || [];

    useEffect(() => {
        if (products && product_id) {
            const matched = products.find(
                (p: TProduct) => p._id === product_id
            );
            if (matched) {
                setSelected(matched);
                setSelectedProduct(matched);
            }
        }
    }, [product_id, products]);

    const handleSelect = (product: TProduct) => {
        setSelected(product);
        setSelectedProduct(product);
    };

    return (
        <div className='mt-4 w-full space-y-4 rounded-md bg-white p-4 md:mt-6'>
            <h3 className='text-lg font-semibold'>Search & Select Product</h3>
            <Popup className='relative w-full'>
                <Popup.Button className='w-full'>
                    {' '}
                    <Input
                        placeholder='Search by name...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Popup.Button>
                <Popup.Body className='absolute top-10 z-[300] max-h-[300px] w-full space-y-2 overflow-auto rounded-md bg-white shadow-2xl'>
                    {isFetching || isLoading ? (
                        <div className='space-y-2 p-2'>
                            <Skeleton className='h-6 w-full' />
                            <Skeleton className='h-6 w-full' />
                            <Skeleton className='h-6 w-full' />
                        </div>
                    ) : (
                        products.map((product) => (
                            <Popup.TriggerClose key={product._id}>
                                <div
                                    className='flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-100'
                                    onClick={() => handleSelect(product)}
                                >
                                    <Image
                                        src={getImgFullUrl(product?.thumbnail)}
                                        width={50}
                                        height={50}
                                        alt='Product'
                                    ></Image>
                                    <p>{product.name}</p>
                                </div>
                            </Popup.TriggerClose>
                        ))
                    )}
                    {(!isFetching || !isLoading) && products?.length === 0 && (
                        <div className='flex items-center justify-center py-10 italic'>
                            Product not found with the name &apos;{searchTerm}
                            &apos;
                        </div>
                    )}
                </Popup.Body>
            </Popup>

            {selected && (
                <div className=''>
                    <h3 className='mb-2 text-lg font-semibold text-green-600'>
                        Selected Product
                    </h3>
                    <Card className='rounded-md border border-green-500 bg-green-50 p-4 shadow-md'>
                        <div className='flex items-center space-x-4'>
                            <Image
                                src={
                                    getImgFullUrl(selected.thumbnail) ||
                                    '/placeholder.png'
                                }
                                alt={selected.name}
                                width={80}
                                height={80}
                                className='rounded object-cover'
                            />
                            <div>
                                <h4 className='text-md font-bold'>
                                    {selected.name}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                    {selected.category?.name_en}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ProductSearchAndSelect;
