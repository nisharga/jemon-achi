import {
    BlogSection,
    BrandSection,
    CTASection,
    FeatureSection,
    HeroSection,
    PricePlanSection,
    ServicesSection,
    TestimonialSection
} from './components';

const HomePage = () => {
    return (
        <>
            <HeroSection />
            <BrandSection />
            <FeatureSection />
            <TestimonialSection />
            <ServicesSection />
            <PricePlanSection />
            <BlogSection />
            <CTASection />
        </>
    );
};

export default HomePage;
