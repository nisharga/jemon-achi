import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/admin-utils';

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none hover:cursor-pointer focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-sm text-primary-foreground shadow-xs hover:bg-primary/90 md:text-base',
                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
                primary: 'bg-primary text-white shadow-xs hover:bg-primary/80',
                action: 'bg-green-500 text-white shadow-xs hover:bg-primary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                green: 'bg-emerald-600 text-white hover:bg-emerald-600/90',
                'green-outline':
                    'bg-emerald-100 text-xs text-emerald-500 hover:bg-emerald-500/20',
                'red-outline':
                    'bg-destructive/10 text-xs text-destructive hover:bg-destructive/20'
            },
            size: {
                default: 'h-9 px-4 py-2 text-sm has-[>svg]:px-3 md:text-sm',
                sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                xl: "h-14 rounded-md px-8 text-base has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
                icon: 'size-9'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot='button'
            className={cn(
                buttonVariants({ variant, size, className }),
                'disabled:cursor-not-allowed disabled:opacity-60'
            )}
            {...props}
        />
    );
}

export { Button, buttonVariants };
