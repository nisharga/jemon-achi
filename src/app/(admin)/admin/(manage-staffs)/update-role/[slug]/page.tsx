import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';
import AddNewRoleForm from '../_components/add-new-role-form';

const UpdateRolePage = async ({
    params
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;

    return (
        <section className='flex flex-col gap-6'>
            <Link
                href='/admin/role'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Roles
            </Link>

            {/* form */}
            <AddNewRoleForm slug={slug} />
        </section>
    );
};

export default UpdateRolePage;
