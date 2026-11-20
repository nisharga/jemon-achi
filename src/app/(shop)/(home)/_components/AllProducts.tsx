'use client';

import { Container } from '@/shop/components/common/container';

// import ProductCard from "@/src/components/common/product-card";

// import { useGetPublishedProductsQuery } from "@/shop/redux/api/publicApi";
// import { IProductFull } from "@/shop/types/IProductFull";
// import { useRouter } from "next/navigation";
// import ProductCardSkeleton from "./ProductCardSkeleton";

export default function AllProducts() {
    // ====== all product api ===========
    /*  const { data, isLoading } = useGetPublishedProductsQuery({
    page: 1,
    limit: 10,
    fields: "sku,thumbnail,category,min_price,max_prices,slug",
  }); */

    //   const product = data?.data?.data ?? [];

    //   const router = useRouter();

    //   const handleAddToCart = (productId: string) => {};

    //   const handleBuyNow = (productId: string) => {
    //     // Navigate to the product details page
    //     router.push(`/details/${productId}`);
    //   };

    return (
        <main className='min-h-screen py-8'>
            <Container className=''>
                <div className='mb-8 text-center'>
                    <h2 className='mb-2 text-2xl tracking-tight text-gray-900'>
                        Discover the Latest Gadgets
                    </h2>
                    <p className='mx-auto max-w-2xl text-sm text-gray-600'>
                        Browse our full collection of cutting-edge gadgets and
                        find your next favorite tech item.
                    </p>
                </div>

                {/*  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {isLoading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))
            : product?.map((product: IProductFull) => (
                <ProductCard
                  key={product?._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
        </div> */}
            </Container>
            <div className='h-16 w-full'></div>
        </main>
    );
}
