'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/shop/components/ui/card';
import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import { Separator } from '@/shop/components/ui/separator';
import { Avatar, AvatarFallback } from '@/shop/components/ui/avatar';
import {
    User,
    Phone,
    Calendar,
    Heart,
    CheckCircle,
    Shield,
    Star,
    TrendingUp,
    LogOut
} from 'lucide-react';
import { useGetUserInfoQuery } from '@/shop/redux/api/auth-api';
import ProfileSkeleton, { NoUser } from './_components/ProfileSkeleton';
import StatListItem from './_components/StatListItem';
import OrderSection from './_components/OrderSection';
import { motion } from 'framer-motion';
import { UserBadges } from './_components/UserBadges';
import CartTitle from './_components/CartTitle';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/shop/components/ui/tabs';
import { useUser } from '@/shop/hooks/use-user';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/shop/lib/logout';

interface UserData {
    _id: string;
    phone_number: string;
    __v: number;
    available_coins: number;
    cancelled_orders: number;
    claimed_coins: any[];
    completed_orders: number;
    createdAt: string;
    favorite_items: any[];
    full_name: string;
    incomplete_orders: number;
    is_verified_number: boolean;
    orders: any[];
    pos_orders: any[];
    returned_orders: number;
    role: string;
    status: string;
    total_orders: number;
    updatedAt: string;
    used_coins_history: any[];
    userType: string;
    id: string;
}

export default function UserProfile() {
    // 1. Get the data directly (extract the nested 'data' property)
    const { data: apiResponse, isLoading: loading } = useGetUserInfoQuery({});
    const userData = apiResponse?.data; // This is your source of truth

    // At the top of your component
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter(); // If you want to redirect after logout
    const Logout = async () => {
        try {
            handleLogout();
            router.push('/'); // Redirect to login
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // fetching
    const totalOrders = apiResponse?.data?.total_orders || 0;
    const returnedOrders = apiResponse?.data?.returned_orders || 0;
    const incompleteOrders = apiResponse?.data?.incomplete_orders || 0;
    const completedOrders = apiResponse?.data?.completed_orders || 0;
    const cancelledOrders = apiResponse?.data?.cancelled_orders || 0;

    const [isEditing, setIsEditing] = useState(false);

    const [editForm, setEditForm] = useState({
        full_name: '',
        phone_number: ''
    });

    // 2. Initialize your form state when data arrives
    useEffect(() => {
        if (userData) {
            setEditForm({
                full_name: userData.full_name,
                phone_number: userData.phone_number
            });
        }
    }, [userData]); // Trigger whenever the API data changes

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!userData) return;

        setIsEditing(false);
    };

    const handleCancel = () => {
        if (userData) {
            setEditForm({
                full_name: userData.full_name,
                phone_number: userData.phone_number
            });
        }
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!userData) {
        return <NoUser />;
    }

    return (
        <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
            <div className='mx-auto max-w-6xl space-y-8'>
                {/* Header Section */}
                <div className='rounded-2xl bg-white shadow-none'>
                    <div className='relative p-8'>
                        <div className='mt-4 flex flex-col items-center gap-6 lg:flex-row'>
                            <div className='relative'>
                                <Avatar className='h-24 w-24 border-4 border-white shadow-lg'>
                                    <AvatarFallback className='bg-primary text-2xl font-normal text-white'>
                                        {getInitials(userData?.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                {userData?.is_verified_number && (
                                    <div className='absolute -right-1 -bottom-1 rounded-full bg-primary p-1.5'>
                                        <CheckCircle className='h-4 w-4 text-secondary' />
                                    </div>
                                )}
                            </div>

                            <div className='flex flex-1 flex-col items-center justify-center lg:flex-none lg:items-start lg:justify-start'>
                                <div className='mb-2 flex items-center gap-3'>
                                    <h1 className='two-xl-medium'>
                                        {userData?.full_name}
                                    </h1>
                                    {userData?.userType === 'REGISTERED' && (
                                        <Star className='h-6 w-6 fill-current text-primary' />
                                    )}
                                </div>
                                <p className='base-medium mb-4 flex items-center gap-2'>
                                    <Phone className='h-4 w-4' />
                                    {userData?.phone_number}
                                </p>

                                <div className='flex flex-wrap gap-2'>
                                    <UserBadges userData={userData} />
                                </div>
                            </div>

                            {/*  <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                    size="lg"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-secondary shadow-sm"
                      size="lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50 bg-transparent"
                      size="lg"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div> */}
                        </div>

                        {/* logout btn */}
                        {user && (
                            <button
                                onClick={Logout}
                                className='absolute top-2 right-2 flex items-center gap-1 p-2 text-red-500 transition-colors hover:text-red-700'
                            >
                                <span className='text-sm font-medium'>
                                    Logout
                                </span>
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* pc show */}
                <div className='hidden gap-6 lg:grid lg:grid-cols-3'>
                    {/* Profile Information */}
                    <div className='space-y-6 lg:col-span-2'>
                        <Card className='border-0 bg-white shadow-none'>
                            <CardHeader className='border-b border-gray-100 bg-gray-50/50'>
                                <CartTitle
                                    title='Profile Information'
                                    icon={
                                        <User className='h-5 w-5 text-white' />
                                    }
                                />
                            </CardHeader>
                            <CardContent className='space-y-6 p-8'>
                                <div className='grid gap-6 md:grid-cols-2'>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                        className='space-y-3'
                                    >
                                        <Label
                                            htmlFor='fullName'
                                            className='sm-medium'
                                        >
                                            Full Name
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                id='fullName'
                                                value={editForm.full_name}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        full_name:
                                                            e?.target?.value
                                                    })
                                                }
                                                className='h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary'
                                            />
                                        ) : (
                                            <div className='flex h-12 items-center rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                <span className='text-xs text-gray-900'>
                                                    {userData?.full_name}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                        className='space-y-3'
                                    >
                                        <Label
                                            htmlFor='phone'
                                            className='sm-medium'
                                        >
                                            Phone Number
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                id='phone'
                                                value={editForm.phone_number}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        phone_number:
                                                            e?.target?.value
                                                    })
                                                }
                                                className='h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary'
                                            />
                                        ) : (
                                            <div className='flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                <Phone className='h-4 w-4 text-gray-500' />
                                                <span className='text-xs text-gray-900'>
                                                    {userData?.phone_number}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                <div className='grid gap-6 md:grid-cols-2'>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                        className='space-y-3'
                                    >
                                        <Label className='sm-medium'>
                                            Role
                                        </Label>
                                        <div className='flex h-12 items-center rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <span className='!text-xs text-gray-900'>
                                                {userData?.role}
                                            </span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                        className='space-y-3'
                                    >
                                        <Label className='sm-medium'>
                                            Account Type
                                        </Label>
                                        <div className='flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <Shield className='h-4 w-4 text-primary' />
                                            <span className='text-xs text-gray-900'>
                                                {userData?.userType}
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className='hidden lg:block'>
                            <OrderSection />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='space-y-6'>
                        {/* Account Details */}
                        <Card className='border-0 bg-white shadow-none'>
                            <CardHeader className='border-b border-gray-100 bg-gray-50/50'>
                                <CartTitle
                                    title='Account Details'
                                    icon={
                                        <Calendar className='h-4 w-4 text-white' />
                                    }
                                />
                            </CardHeader>
                            <CardContent className='space-y-6 p-6'>
                                <div className='space-y-4'>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                    >
                                        <Label className='sm-medium mb-2 block'>
                                            Member Since
                                        </Label>
                                        <p className='nav-see-more'>
                                            {formatDate(userData?.createdAt)}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1 * 0.1
                                        }}
                                        viewport={{ once: true }}
                                    >
                                        <Label className='sm-medium mb-2 block'>
                                            Last Updated
                                        </Label>
                                        <p className='nav-see-more'>
                                            {formatDate(userData?.updatedAt)}
                                        </p>
                                    </motion.div>
                                </div>

                                <Separator />

                                <div className='space-y-4'>
                                    <h4 className='flex items-center gap-2 font-normal text-gray-900'>
                                        <TrendingUp className='h-4 w-4 text-primary' />
                                        Order Statistics
                                    </h4>
                                    <div className='space-y-3'>
                                        <StatListItem
                                            label='Total Orders'
                                            value={totalOrders}
                                            variant='blue'
                                        />
                                        <StatListItem
                                            label='Incomplete Orders'
                                            value={incompleteOrders}
                                            variant='purple'
                                        />

                                        <StatListItem
                                            label='Returned Orders'
                                            value={completedOrders}
                                            variant='orange'
                                        />

                                        <StatListItem
                                            label='Returned Orders'
                                            value={returnedOrders}
                                            variant='purple'
                                        />

                                        <StatListItem
                                            label='Cancelled Orders'
                                            value={cancelledOrders}
                                            variant='red'
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className='space-y-4'>
                                    <h4 className='flex items-center gap-2 font-normal text-gray-900'>
                                        <Star className='h-4 w-4 text-primary' />
                                        Rewards & Activity
                                    </h4>
                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between rounded-lg bg-red-50 p-3'>
                                            <span className='sm-normal flex items-center gap-2'>
                                                <Heart className='h-4 w-4 text-red-500' />
                                                Favorite Items
                                            </span>
                                            <span className='font-normal text-red-600'>
                                                {
                                                    userData?.favorite_items
                                                        .length
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* mobile show */}
                <div className='block w-full lg:hidden'>
                    <Tabs defaultValue='profile' className='w-full'>
                        {/* The Navigation Bar */}
                        <TabsList className='grid w-full grid-cols-3 bg-primary/10 p-1'>
                            <TabsTrigger
                                value='profile'
                                className='base-medium'
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value='account'
                                className='base-medium'
                            >
                                Account
                            </TabsTrigger>
                            <TabsTrigger
                                value='history'
                                className='base-medium'
                            >
                                Order History
                            </TabsTrigger>
                        </TabsList>

                        {/* 1. Profile Information */}
                        <TabsContent value='profile' className='mt-6 space-y-4'>
                            {/* Profile Information */}
                            <div className='space-y-6 lg:col-span-2'>
                                <Card className='border-0 bg-white shadow-none'>
                                    <CardHeader className='border-b border-gray-100 bg-gray-50/50'>
                                        <CartTitle
                                            title='Profile Information'
                                            icon={
                                                <User className='h-5 w-5 text-white' />
                                            }
                                        />
                                    </CardHeader>
                                    <CardContent className='space-y-6 p-8'>
                                        <div className='grid gap-6 md:grid-cols-2'>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 1 * 0.1
                                                }}
                                                viewport={{ once: true }}
                                                className='space-y-3'
                                            >
                                                <Label
                                                    htmlFor='fullName'
                                                    className='sm-medium'
                                                >
                                                    Full Name
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id='fullName'
                                                        value={
                                                            editForm?.full_name
                                                        }
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                full_name:
                                                                    e?.target
                                                                        .value
                                                            })
                                                        }
                                                        className='h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary'
                                                    />
                                                ) : (
                                                    <div className='flex h-12 items-center rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                        <span className='text-xs text-gray-900'>
                                                            {
                                                                userData?.full_name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 1 * 0.1
                                                }}
                                                viewport={{ once: true }}
                                                className='space-y-3'
                                            >
                                                <Label
                                                    htmlFor='phone'
                                                    className='sm-medium'
                                                >
                                                    Phone Number
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id='phone'
                                                        value={
                                                            editForm?.phone_number
                                                        }
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                phone_number:
                                                                    e?.target
                                                                        ?.value
                                                            })
                                                        }
                                                        className='h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary'
                                                    />
                                                ) : (
                                                    <div className='flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                        <Phone className='h-4 w-4 text-gray-500' />
                                                        <span className='text-xs text-gray-900'>
                                                            {
                                                                userData?.phone_number
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>

                                        <div className='grid gap-6 md:grid-cols-2'>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 1 * 0.1
                                                }}
                                                viewport={{ once: true }}
                                                className='space-y-3'
                                            >
                                                <Label className='sm-medium'>
                                                    Role
                                                </Label>
                                                <div className='flex h-12 items-center rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                    <span className='!text-xs text-gray-900'>
                                                        {userData?.role}
                                                    </span>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 1 * 0.1
                                                }}
                                                viewport={{ once: true }}
                                                className='space-y-3'
                                            >
                                                <Label className='sm-medium'>
                                                    Account Type
                                                </Label>
                                                <div className='flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                    <Shield className='h-4 w-4 text-primary' />
                                                    <span className='text-xs text-gray-900'>
                                                        {userData?.userType}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className='hidden lg:block'>
                                    <OrderSection />
                                </div>
                            </div>
                        </TabsContent>

                        {/* 2. Account Details */}
                        <TabsContent value='account' className='mt-6 space-y-4'>
                            {/* Account Details */}
                            <Card className='border-0 bg-white shadow-none'>
                                <CardHeader className='border-b border-gray-100 bg-gray-50/50'>
                                    <CartTitle
                                        title='Account Details'
                                        icon={
                                            <Calendar className='h-4 w-4 text-white' />
                                        }
                                    />
                                </CardHeader>
                                <CardContent className='space-y-6 p-6'>
                                    <div className='space-y-4'>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 1 * 0.1
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            <Label className='sm-medium mb-2 block'>
                                                Member Since
                                            </Label>
                                            <p className='nav-see-more'>
                                                {formatDate(
                                                    userData?.createdAt
                                                )}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 1 * 0.1
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            <Label className='sm-medium mb-2 block'>
                                                Last Updated
                                            </Label>
                                            <p className='nav-see-more'>
                                                {formatDate(
                                                    userData?.updatedAt
                                                )}
                                            </p>
                                        </motion.div>
                                    </div>

                                    <Separator />

                                    <div className='space-y-4'>
                                        <h4 className='flex items-center gap-2 font-normal text-gray-900'>
                                            <TrendingUp className='h-4 w-4 text-primary' />
                                            Order Statistics
                                        </h4>
                                        <div className='space-y-3'>
                                            <StatListItem
                                                label='Total Orders'
                                                value={totalOrders}
                                                variant='blue'
                                            />
                                            <StatListItem
                                                label='Incomplete Orders'
                                                value={incompleteOrders}
                                                variant='purple'
                                            />

                                            <StatListItem
                                                label='Returned Orders'
                                                value={completedOrders}
                                                variant='orange'
                                            />

                                            <StatListItem
                                                label='Returned Orders'
                                                value={returnedOrders}
                                                variant='purple'
                                            />

                                            <StatListItem
                                                label='Cancelled Orders'
                                                value={cancelledOrders}
                                                variant='red'
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className='space-y-4'>
                                        <h4 className='flex items-center gap-2 font-normal text-gray-900'>
                                            <Star className='h-4 w-4 text-primary' />
                                            Rewards & Activity
                                        </h4>
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between rounded-lg bg-red-50 p-3'>
                                                <span className='sm-normal flex items-center gap-2'>
                                                    <Heart className='h-4 w-4 text-red-500' />
                                                    Favorite Items
                                                </span>
                                                <span className='font-normal text-red-600'>
                                                    {
                                                        userData?.favorite_items
                                                            ?.length
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 3. Order History */}
                        <TabsContent value='history' className='mt-6 space-y-4'>
                            <OrderSection />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
