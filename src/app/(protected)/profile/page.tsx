import type { Metadata } from 'next';
import { ProfileCard } from './components';

export const metadata: Metadata = {
    title: 'My Profile'
};

const ProfilePage = () => <ProfileCard />;

export default ProfilePage;
