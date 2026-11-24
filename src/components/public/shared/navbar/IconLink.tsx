import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
    href: string;
    icon: ReactNode;
    /** Visible text; when missing, `label` is read out by screen readers instead. */
    children?: ReactNode;
    label?: string;
};

/** Header link with an icon, e.g. "Offers" or the delivery-tracking truck. */
export default function IconLink({ href, icon, children, label }: Props) {
    return (
        <Link
            href={href}
            aria-label={children ? undefined : label}
            className='nav-link flex items-center gap-1.5 px-1 hover:text-black'
        >
            <span className='text-primary-ink' aria-hidden='true'>
                {icon}
            </span>
            {children && <span className='mt-1'>{children}</span>}
        </Link>
    );
}
