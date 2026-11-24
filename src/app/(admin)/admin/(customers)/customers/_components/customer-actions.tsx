import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { TUser } from '@/types/admin/user';
import { Ellipsis } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const CustomerActions = ({ customer }: { customer: TUser }) => {
    const router = useRouter();
    const handleBlock = () => {
        toast.info(`Blocking customer: ${customer._id}`);
        // Future implementation: call API to block customer using customer.id
    };
    return (
        <div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={handleBlock}
                        className='cursor-pointer'
                    >
                        Block This Customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() =>
                            router.push(
                                `/admin/password-change-customer/${customer._id}`
                            )
                        }
                        className='cursor-pointer'
                    >
                        Change Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => toast.info('Feature coming soon!')}
                        className='cursor-pointer'
                    >
                        Delete Customer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default CustomerActions;
