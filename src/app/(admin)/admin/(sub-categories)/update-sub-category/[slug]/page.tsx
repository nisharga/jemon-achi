import React from 'react';
import UpdateSubCategoryForm from './_components/update-sub-category-form';
import SectionTitle from '@/components/shared/section-title';

const UpdateSubCategoryPage = async ({
    params
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;

    if (!slug) {
        return (
            <div className='py-10 text-center text-base font-medium'>
                Slug Missing In URL
            </div>
        );
    }
    return (
        <section className='flex flex-col gap-6'>
            <SectionTitle
                title='Update Sub Category'
                url='/admin/sub-categories'
            />

            <UpdateSubCategoryForm slug={slug} />
        </section>
    );
};

export default UpdateSubCategoryPage;
