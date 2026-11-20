import BottomMenu from '@/shop/components/common/BottomMenu';
import Footer from '@/shop/components/shared/Footer';
import Navbar from '@/shop/components/shared/Navbar';

export default async function HomeLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='overflow-x-hidden bg-[#f8f6f3]'>
            <Navbar />
            {children}
            <BottomMenu />
            <Footer />
        </main>
    );
}
