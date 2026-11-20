import React from 'react';
import UpdateCategoryForm from './_components/update-category-form';
import SectionTitle from '@/admin/components/shared/section-title';

const UpdateCategoryPage = async ({
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
            <SectionTitle title='Update Category' url='/admin/categories' />
            <UpdateCategoryForm slug={slug} />
        </section>
    );
};

export default UpdateCategoryPage;
