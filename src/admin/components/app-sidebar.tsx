'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/admin/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/admin/components/ui/sidebar';
import Link from 'next/link';
import { SIDEBAR_LINKS } from '@/admin/constants/sidebar-links';
import { usePathname } from 'next/navigation';
import { cn } from '@/admin/lib/utils';
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader className='flex h-16 items-start justify-center border-b bg-primary pl-4'>
                <Link
                    href='/admin/overview'
                    className='flex w-fit items-center gap-1 text-xl font-medium text-primary'
                >
                    <div className='size-fit rounded-md'>
                        <Image
                            src={'/logo/logo_icon_transparent.png'}
                            alt='logo'
                            width={300}
                            height={100}
                            className='h-12 w-full'
                        />
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent className='font-inter gap-0'>
                {SIDEBAR_LINKS?.map((item) => (
                    <Collapsible
                        key={item.title}
                        title={item.title}
                        defaultOpen
                        className='group/collapsible'
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className='group/label bg-primary/5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            >
                                <CollapsibleTrigger className=''>
                                    {item.title}
                                    <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu className='mt-2'>
                                        {item.items.map((item) => (
                                            <SidebarMenuItem
                                                key={item.title}
                                                className='ml-2'
                                            >
                                                <SidebarMenuButton
                                                    asChild
                                                    className={cn('', {
                                                        'bg-primary text-white':
                                                            pathname ===
                                                            item.url
                                                    })}
                                                >
                                                    <Link
                                                        href={item.url}
                                                        className={
                                                            item?.url ===
                                                            '/admin/fraud-checker'
                                                                ? 'md:hidden'
                                                                : 'block'
                                                        }
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
