'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoggedInUser, useLogout } from '@/hooks';
import { routes } from '@/routes';
import { LogOut } from 'lucide-react';

const getInitials = (name?: string) =>
    (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

/** Shows the logged-in customer's account details. */
const ProfileCard = () => {
    const { profile, isLoading } = useLoggedInUser(routes.login);
    const handleLogout = useLogout(routes.login);

    const details = [
        { label: 'Phone', value: profile?.phone_number },
        { label: 'Email', value: profile?.email },
        { label: 'Status', value: profile?.status }
    ];

    return (
        <Card className='mx-auto w-full max-w-xl'>
            <CardHeader className='flex flex-row items-center gap-4'>
                {isLoading ? (
                    <Skeleton className='size-14 rounded-full' />
                ) : (
                    <Avatar className='size-14'>
                        <AvatarImage
                            src={profile?.profile_url}
                            alt={profile?.full_name}
                        />
                        <AvatarFallback>
                            {getInitials(profile?.full_name)}
                        </AvatarFallback>
                    </Avatar>
                )}
                <div className='grid gap-1'>
                    {isLoading ? (
                        <Skeleton className='h-5 w-40' />
                    ) : (
                        <CardTitle>
                            {profile?.full_name ?? 'My account'}
                        </CardTitle>
                    )}
                    <CardDescription>Your account details</CardDescription>
                </div>
            </CardHeader>

            <CardContent className='grid gap-6'>
                <dl className='grid gap-3 text-sm'>
                    {details.map(({ label, value }) => (
                        <div
                            key={label}
                            className='flex items-center justify-between gap-4 border-b pb-3 last:border-0'
                        >
                            <dt className='text-muted-foreground'>{label}</dt>
                            <dd className='font-medium'>
                                {isLoading ? (
                                    <Skeleton className='h-4 w-28' />
                                ) : label === 'Status' && value ? (
                                    <Badge variant='secondary'>{value}</Badge>
                                ) : (
                                    (value ?? '—')
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>

                <Button
                    onClick={handleLogout}
                    variant='destructive'
                    className='justify-self-end'
                >
                    <LogOut />
                    Logout
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;
