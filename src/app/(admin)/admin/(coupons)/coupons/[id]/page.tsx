import SectionTitle from '@/components/shared/section-title';
import React from 'react';
import SingleCouponPage from './_component/SingleCouponPage';

const page = () => {
    return (
        <div>
            <SectionTitle title={`Coupon Details`} url='/admin/coupons' />
            <div className='mb-6'></div>
            <SingleCouponPage />
        </div>
    );
};

export default page;
