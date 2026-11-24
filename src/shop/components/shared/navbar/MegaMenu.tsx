import Link from 'next/link';
import type { NavSubCategory } from './types';

/** Big dropdown under the header: one column per subcategory, with its sub-subcategories. */
export default function MegaMenu({
    subcategories
}: {
    subcategories: NavSubCategory[];
}) {
    return (
        <div className='absolute top-[100px] left-1/2 z-40 w-full max-w-7xl -translate-x-1/2 px-4'>
            <div className='grid grid-cols-3 gap-8 rounded-[20px] bg-white p-10 shadow-2xl'>
                {subcategories.map((sub) => (
                    <div key={sub._id}>
                        <Link
                            href={`/products/${sub.slug}`}
                            className='sm-semibold mb-2 block hover:text-blue-700'
                        >
                            {sub.name_en}
                        </Link>
                        <ul className='space-y-2 text-sm text-gray-600'>
                            {sub.sub_subcategories?.map((item) => (
                                <li key={item._id}>
                                    <Link
                                        href={`/products/${item.slug}`}
                                        className='inline-block transition-transform hover:translate-x-1 hover:text-blue-700'
                                    >
                                        {item.name_en}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
