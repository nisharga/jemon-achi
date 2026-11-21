'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Trash2,
    RefreshCcw,
    Eye,
    EyeOff,
    Edit,
    X,
    GripVertical
} from 'lucide-react';

import {
    useGetAllTopBarMessagesQuery,
    useAddTopBarMessageMutation,
    useUpdateTopBarMessageMutation,
    useDeleteTopBarMessageMutation,
    useToggleTopBarMessageMutation
} from '@/redux/api-queries/topbar-api';

import { Button } from '@/components/ui/admin-button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/admin-card';
import { Input } from '@/components/ui/admin-input';
import { Label } from '@/components/ui/admin-label';
import { Skeleton } from '@/components/ui/admin-skeleton';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { Switch } from '@/components/ui/switch';

type TTopBarMessage = {
    _id?: string;
    message: string;
    enabled: boolean;
    position: number;
};

const DEFAULT_MESSAGE_FORM: TTopBarMessage = {
    message: '',
    enabled: true,
    position: 1
};

const HeaderPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.CMS_VIEW,
            PermissionEnum.CMS_CREATE,
            PermissionEnum.CMS_UPDATE,
            PermissionEnum.CMS_DELETE
        ]
    });

    // === API hooks ===
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
        refetch
    } = useGetAllTopBarMessagesQuery({});

    const [addMessage, { isLoading: isAdding }] = useAddTopBarMessageMutation();
    const [updateMessage] = useUpdateTopBarMessageMutation();
    const [deleteMessage] = useDeleteTopBarMessageMutation();
    const [toggleMessage] = useToggleTopBarMessageMutation();

    // === UI state ===
    const [messages, setMessages] = useState<TTopBarMessage[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] =
        useState<TTopBarMessage>(DEFAULT_MESSAGE_FORM);
    const [newMessageForm, setNewMessageForm] =
        useState<TTopBarMessage>(DEFAULT_MESSAGE_FORM);

    // Hydrate messages from API data
    useEffect(() => {
        if (messagesData?.data) {
            setMessages(messagesData.data);
        }
    }, [messagesData]);

    // === Handlers ===

    const handleAddMessage = async () => {
        if (!newMessageForm.message.trim()) {
            toast.error('Message text is required');
            return;
        }

        if (newMessageForm.message.length > 200) {
            toast.error('Message must not exceed 200 characters');
            return;
        }

        try {
            const res: any = await addMessage({
                message: newMessageForm.message.trim(),
                enabled: newMessageForm.enabled
            }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Message added successfully');
                setNewMessageForm(DEFAULT_MESSAGE_FORM);
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to add message');
        }
    };

    const handleUpdateMessage = async (messageId: string) => {
        if (!editForm.message.trim()) {
            toast.error('Message text is required');
            return;
        }

        if (editForm.message.length > 200) {
            toast.error('Message must not exceed 200 characters');
            return;
        }

        try {
            const res: any = await updateMessage({
                messageId,
                message: editForm.message.trim(),
                enabled: editForm.enabled,
                position: editForm.position
            }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Message updated successfully');
                setEditingId(null);
                setEditForm(DEFAULT_MESSAGE_FORM);
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to update message');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const res: any = await deleteMessage({ messageId }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Message deleted successfully');
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to delete message');
        }
    };

    const handleToggleEnabled = async (messageId: string) => {
        try {
            const res: any = await toggleMessage({ messageId }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Message status updated');
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to update message status');
        }
    };

    const startEdit = (message: TTopBarMessage) => {
        setEditingId(message._id || null);
        setEditForm({ ...message });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(DEFAULT_MESSAGE_FORM);
    };

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='space-y-6 p-4'>
            {/* Header */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='text-xl font-semibold md:text-2xl'>
                        Header Management
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage top bar announcement messages that appear on the
                        frontend.
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => refetch()}
                        disabled={isMessagesLoading}
                    >
                        <RefreshCcw className='mr-2 h-4 w-4' />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Add New Message Card */}
                <Card className='rounded-2xl lg:col-span-1'>
                    <CardHeader>
                        <CardTitle className='text-lg'>
                            Add New Message
                        </CardTitle>
                        <CardDescription>
                            Create a new announcement for the top bar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='new-message'>Message Text</Label>
                            <Input
                                id='new-message'
                                value={newMessageForm.message}
                                onChange={(e) =>
                                    setNewMessageForm({
                                        ...newMessageForm,
                                        message: e.target.value
                                    })
                                }
                                placeholder='Enter announcement text'
                                maxLength={200}
                            />
                            <p className='text-xs text-muted-foreground'>
                                {newMessageForm.message.length}/200 characters
                            </p>
                        </div>

                        <div className='flex items-center justify-between'>
                            <Label htmlFor='new-enabled'>Show on website</Label>
                            <Switch
                                id='new-enabled'
                                checked={newMessageForm.enabled}
                                onCheckedChange={(checked) =>
                                    setNewMessageForm({
                                        ...newMessageForm,
                                        enabled: checked
                                    })
                                }
                            />
                        </div>

                        <Button
                            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                            onClick={handleAddMessage}
                            disabled={
                                isAdding || !newMessageForm.message.trim()
                            }
                        >
                            {isAdding && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Add Message
                        </Button>
                    </CardContent>
                </Card>

                {/* Messages List Card */}
                <Card className='rounded-2xl lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='text-lg'>
                            All Messages ({messages.length})
                        </CardTitle>
                        <CardDescription>
                            Messages are displayed in order on the frontend
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isMessagesLoading ? (
                            <div className='space-y-3'>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className='h-24 w-full' />
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className='py-8 text-center text-muted-foreground'>
                                <p>
                                    No messages found. Add your first
                                    announcement!
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {messages.map((message) => (
                                    <div
                                        key={message._id}
                                        className='space-y-3 rounded-xl border p-4 transition hover:bg-muted/20'
                                    >
                                        {editingId === message._id ? (
                                            // Edit Mode
                                            <div className='space-y-3'>
                                                <div className='space-y-2'>
                                                    <Label>Message Text</Label>
                                                    <Input
                                                        value={editForm.message}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                message:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                        placeholder='Enter announcement text'
                                                        maxLength={200}
                                                    />
                                                    <p className='text-xs text-muted-foreground'>
                                                        {
                                                            editForm.message
                                                                .length
                                                        }
                                                        /200 characters
                                                    </p>
                                                </div>

                                                <div className='flex items-center justify-between'>
                                                    <div className='flex items-center gap-2'>
                                                        <Label
                                                            htmlFor={`edit-enabled-${message._id}`}
                                                        >
                                                            Show on website
                                                        </Label>
                                                        <Switch
                                                            id={`edit-enabled-${message._id}`}
                                                            checked={
                                                                editForm.enabled
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    enabled:
                                                                        checked
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={cancelEdit}
                                                        >
                                                            <X className='mr-1 h-4 w-4' />
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            onClick={() =>
                                                                handleUpdateMessage(
                                                                    message._id!
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className='flex items-start justify-between gap-3'>
                                                <div className='flex flex-1 items-start gap-3'>
                                                    <GripVertical className='mt-1 h-5 w-5 text-muted-foreground' />
                                                    <div className='flex-1'>
                                                        <div className='mb-1 flex items-center gap-2'>
                                                            <span className='text-xs font-medium text-muted-foreground'>
                                                                Position{' '}
                                                                {
                                                                    message.position
                                                                }
                                                            </span>
                                                            <div className='flex items-center gap-1'>
                                                                {message.enabled ? (
                                                                    <Eye className='h-3 w-3 text-green-600' />
                                                                ) : (
                                                                    <EyeOff className='h-3 w-3 text-gray-400' />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p
                                                            className={`text-sm ${
                                                                !message.enabled
                                                                    ? 'text-muted-foreground line-through'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {message.message}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-1'>
                                                    <Button
                                                        size='icon'
                                                        variant='ghost'
                                                        className='h-8 w-8'
                                                        onClick={() =>
                                                            handleToggleEnabled(
                                                                message._id!
                                                            )
                                                        }
                                                        title={
                                                            message.enabled
                                                                ? 'Disable'
                                                                : 'Enable'
                                                        }
                                                    >
                                                        {message.enabled ? (
                                                            <Eye className='h-4 w-4' />
                                                        ) : (
                                                            <EyeOff className='h-4 w-4' />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size='icon'
                                                        variant='ghost'
                                                        className='h-8 w-8'
                                                        onClick={() =>
                                                            startEdit(message)
                                                        }
                                                        title='Edit'
                                                    >
                                                        <Edit className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        size='icon'
                                                        variant='ghost'
                                                        className='h-8 w-8 text-destructive hover:text-destructive'
                                                        onClick={() =>
                                                            handleDeleteMessage(
                                                                message._id!
                                                            )
                                                        }
                                                        title='Delete'
                                                    >
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Info Card */}
            <Card className='rounded-2xl bg-muted/30'>
                <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                            <Plus className='h-4 w-4 text-primary' />
                        </div>
                        <div className='space-y-1'>
                            <p className='text-sm font-medium'>Tips</p>
                            <ul className='space-y-1 text-sm text-muted-foreground'>
                                <li>
                                    • Messages are automatically ordered by
                                    position
                                </li>
                                <li>
                                    • Only enabled messages are shown on the
                                    frontend
                                </li>
                                <li>
                                    • Messages are displayed as a rotating
                                    slideshow
                                </li>
                                <li>
                                    • Maximum message length is 200 characters
                                </li>
                                <li>
                                    • You can toggle messages on/off without
                                    deleting them
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HeaderPage;
