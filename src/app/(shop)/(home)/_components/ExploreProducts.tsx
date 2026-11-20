import { Container } from '@/shop/components/common/container';
import PriceContainer from '@/shop/components/common/PriceContainer';
import { NoData } from '@/shop/components/global/ErrorState';
import ProductCardProperty from '@/shop/components/global/ProductCardProperty';
import SectionLink from '@/shop/components/global/SectionLink';
import SectionTitle from '@/shop/components/global/SectionTitle';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/shop/components/ui/tabs';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useGetExploreProductsQuery } from '@/shop/redux/api/product-api';
import { useGetCmsHomePageQuery } from '@/shop/redux/api/publicApi';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface IProps {
    product_ids: IItem[];
    _id: string;
    name: string;
    slug: string;
    position: number;
}

interface IItem {
    _id: number;
    name: string;
    slug: string;
    thumbnail: string;
    product_card_properties: [];
}

const ExploreProduct = () => {
    const { data, isLoading } = useGetCmsHomePageQuery({});
    const newArrivals = data?.data?.new_arrivals || [];
    const defaultTag = newArrivals[0]?.slug; // tech

    if (!defaultTag || isLoading) {
        return <ExploreSkeleton />;
    }
    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 sm:mb-4'>
                <SectionTitle title='New Arrivals' />
            </div>

            <Tabs defaultValue={defaultTag} className='w-full'>
                <div className='mb-2 flex items-center justify-between lg:mb-8'>
                    <TabsList className='sm:no-wrap flex h-auto flex-wrap gap-2 rounded-none bg-transparent p-0 lg:gap-4'>
                        {newArrivals?.map(({ name, slug }: IProps) => {
                            return (
                                <TabsTrigger
                                    key={slug}
                                    value={slug}
                                    className='sm-medium flex cursor-pointer items-center justify-center rounded border border-primary !pt-[16px] !pb-[13px] !leading-1 font-normal text-primary transition-all data-[state=active]:rounded data-[state=active]:border-black data-[state=active]:bg-primary data-[state=active]:font-medium data-[state=active]:text-white'
                                >
                                    {name}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {/* <SectionLink label="View All" url="/products" /> */}
                </div>
                {newArrivals?.map((item: IProps) => (
                    <TabsContent value={item?.slug} key={item?._id}>
                        {newArrivals?.length === 0 ? (
                            <NoData message='no product found' />
                        ) : (
                            <div className='grid grid-cols-2 gap-2 md:grid-cols-4 lg:gap-6'>
                                {item?.product_ids?.map((item: IItem) => {
                                    const id = item?._id || '';
                                    const thumbnail = item?.thumbnail;
                                    const title = item?.name || '';
                                    const url = `/product/${item?.slug}`;
                                    const product_card_properties =
                                        item?.product_card_properties || [];

                                    const oldPrice = 10000;
                                    const newPrice = 8009;

                                    return (
                                        <motion.a
                                            initial={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.9
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: 'easeOut'
                                            }}
                                            key={id}
                                            className='group block cursor-pointer text-center'
                                            href={url}
                                            layout
                                        >
                                            <div className='mb-2 aspect-square overflow-hidden rounded-lg bg-[#F3F3F3] shadow-sm transition-shadow lg:mb-4'>
                                                <Image
                                                    src={getMediaUrl(thumbnail)}
                                                    alt={title}
                                                    width={500}
                                                    height={500}
                                                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                                                />
                                            </div>
                                            <h3 className='base-normal capitalize lg:uppercase'>
                                                {title}
                                            </h3>

                                            <PriceContainer
                                                newPrice={newPrice}
                                                oldPrice={oldPrice}
                                                className='justify-center'
                                            />

                                            {product_card_properties && (
                                                <ProductCardProperty
                                                    product_card_properties={
                                                        product_card_properties
                                                    }
                                                />
                                            )}
                                        </motion.a>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </Container>
    );
};

export default ExploreProduct;

const ExploreSkeleton = () => (
    <Container className='py-2 sm:py-8'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className='space-y-3'>
                    <div className='aspect-square animate-pulse rounded-xl bg-neutral-200' />
                    <div className='mx-auto h-4 w-2/3 animate-pulse rounded bg-neutral-200' />
                </div>
            ))}
        </div>
    </Container>
);
