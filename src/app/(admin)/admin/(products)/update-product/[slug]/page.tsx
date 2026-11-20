import React from 'react';
import UpdateProductForm from './_components/update-product-form';
import SectionTitle from '@/admin/components/shared/section-title';

const UpdateProductPage = async ({
    params
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;
    // console.log(slug);

    return (
        <section className='flex flex-col gap-6'>
            <SectionTitle title='Update Product' url='/admin/products' />
            <UpdateProductForm slug={slug} />
        </section>
    );
};

export default UpdateProductPage;
