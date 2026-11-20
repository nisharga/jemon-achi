'use client';
import dynamic from 'next/dynamic';
// import HeroVideoSlider from "./_components/HeroVideoSlider";
// import ShopByCategory from "./_components/ShopByCategory";
import ExploreProduct from './_components/ExploreProducts';
import BundleOffer from './_components/BundleOffer';
import BankOffers from './_components/BankOffers';
import CommunitySection from './_components/CommunitySection';
import BestSelling from './_components/BestSelling';
import CategoryProducts from './_components/CategoryProducts';
import ShopByLeather from './_components/ShopByLeather';
import { RandomPublicProducts } from './_components';

const HomePageMain = () => {
    // Dynamic imports
    const HeroVideoSlider = dynamic(
        () => import('./_components/HeroVideoSlider'),
        {
            loading: () => <div className='h-64 animate-pulse bg-gray-100' /> // Optional skeleton
        }
    );

    const ShopByCategory = dynamic(
        () => import('./_components/ShopByCategory'),
        {
            loading: () => <div className='h-40 animate-pulse bg-gray-100' />
        }
    );
    return (
        <div>
            <HeroVideoSlider />
            <ShopByCategory />
            <BestSelling />
            <CategoryProducts />
            {/* <ExploreProduct /> */}
            {/* <BundleOffer /> */}
            {/* <ShopByLeather /> */}
            <RandomPublicProducts />
            {/* <BankOffers /> */}
            {/* <CommunitySection /> */}
        </div>
    );
};

export default HomePageMain;
