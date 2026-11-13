'use client';

import Logo from '@/components/Logo';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
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
} from '@/components/ui/sidebar';
import { routes } from '@/routes';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';
import { SIDEBAR_LINKS } from '../static';

const AppSidebar = (props: ComponentProps<typeof Sidebar>) => {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader className='flex h-16 items-start justify-center border-b pl-4'>
                <Link href={routes.admin.base} className='w-fit'>
                    <Logo />
                </Link>
            </SidebarHeader>

            <SidebarContent className='gap-0'>
                {SIDEBAR_LINKS.map((group) => (
                    <Collapsible
                        key={group.label}
                        title={group.title}
                        defaultOpen
                        className='group/collapsible'
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className='group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            >
                                <CollapsibleTrigger>
                                    {group.title}
                                    <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu className='mt-2'>
                                        {group.items.map((item) => (
                                            <SidebarMenuItem
                                                key={item.url}
                                                className='ml-2'
                                            >
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={
                                                        pathname === item.url
                                                    }
                                                >
                                                    <Link href={item.url}>
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
};

export default AppSidebar;
