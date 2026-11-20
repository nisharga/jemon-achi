import { HERO_FEATURES, SERVICES } from './HomeFeaturesList';
import { BLOGS_POST } from './blogs';
export const HERO_SECTION = {
    heading: {
        title: 'Automated Software Asset Management %Built Specifically% for MSPs',
        description:
            'Proactively monitor and manage software usage and costs with SaaS-based automated monitoring that deploys in minutes with:'
    },
    features: HERO_FEATURES,
    buttons: [
        {
            label: 'Request a Demo',
            url: '/landing/contact-us',
            type: 'primary'
        }
    ]
};

export const BRAND_SECTION = {
    heading: {
        title: 'Pre-Built Connectors for Industry Leading Brands'
    },
    brands: [
        {
            name: '',
            logo: '/images/brands/tru-brand-1.svg'
        },
        {
            name: '',
            logo: '/images/brands/tru-brand-2.svg'
        },
        {
            name: '',
            logo: '/images/brands/tru-brand-3.svg'
        },
        {
            name: '',
            logo: '/images/brands/tru-brand-4.svg'
        },
        {
            name: '',
            logo: '/images/brands/tru-brand-5.svg'
        },
        {
            name: '',
            logo: '/images/brands/tru-brand-6.svg'
        }
    ]
};

export const FEATURE_SECTION = {
    heading: {
        title: 'What are the features we provide?',
        description: `TruUp is the game-changer that MSPs have been awaiting, offering a meticulous check and balance system for software transactions. With a core focus on ensuring the precise correlation between what MSPs charge their clients for software usage and what they pay vendors, TruUp operates as the industry's watchdog, guaranteeing financial accuracy and integrity.`
    },
    list: [
        'Pre-built connectors for industry leading software',
        'Customizable API integrations',
        'Checks and balances for software usage',
        'Software compliancy monitoring',
        'Maximized savings'
    ],
    image: '/images/feature-section-img.webp',
    link: {
        label: 'Chat With Us',
        url: '/landing/contact-us'
    }
};

export const TESTIMONIAL_SECTION = {
    heading: {
        title: 'Don’t just take our word for it.',
        description: `MSPs urgently need TruUp to revolutionize their operational landscape and establish a new standard of financial integrity. TruUp serves as a crucial ally, eliminating the persistent challenges of inaccurate billing and vendor payments within the MSP industry.`
    },
    details: `By meticulously cross-verifying software usage and corresponding vendor charges, TruUp ensures that MSPs bill clients accurately and remunerate vendors fairly. This not only eradicates revenue leakages but also establishes unprecedented transparency, fostering trust between MSPs and their clients.`,
    reviews: [
        {
            id: '1',
            name: 'Sarah Thompson',
            title: 'MSP Owner',
            comments: `“I can't stress enough how crucial a solution like TruUp would be for us. The constant struggle of tracking software licenses and ensuring accurate billing is holding us back. We need a game-changer that simplifies this process, brings transparency, and ultimately helps us build stronger relationships with our clients.”`
        },
        {
            id: '2',
            name: 'John Rodriguez',
            title: 'IT Director at an MSP',
            comments: `“In the MSP world, precision is everything, and we are in desperate need of a financial compass. Currently, aligning what we charge clients with what we pay vendors feels like walking a tightrope. We need a solution that goes beyond the numbers, something like TruUp that can elevate our game and restore confidence in our financial operations.”`
        },
        {
            id: '3',
            name: 'Amanda Chen',
            title: 'Operations Manager, MSP Firm',
            comments: `“Value delivery is at the core of the MSP industry, and we're craving a secret weapon. The current challenges in tracking accurate billing and ensuring fair vendor payments are holding us back. We need a solution like TruUp that ensures our billing is accurate, vendor payments are fair, and, most importantly, builds unwavering trust with our clients.”`
        },
        {
            id: '4',
            name: 'Michael Turner',
            title: 'MSP Consultant',
            comments: `“For any MSP serious about financial integrity, we're desperately seeking a game-changer. The constant worry about billing errors is a distraction. We need a financial guardian, something like TruUp, to allow us to focus on delivering exceptional service without the constant anxiety of billing discrepancies.”`
        },
        {
            id: '5',
            name: 'Emily Lewis',
            title: 'MSP CFO',
            comments: `“As an MSP CFO, I can tell you that TruUp would be a financial game-changer for us. The reduction in billing errors and the boost in client trust are things we are actively seeking. We need more than just software; we need a philosophy of precision that can set us up for long-term success. A product like TruUp is what we've been looking for.”`
        }
    ]
};

export const SERVICES_SECTION = {
    heading: {
        title: 'Capabilities that scale with your business.',
        description: `TruUp boasts a highly scalable architecture, making it adaptable to the diverse and evolving needs of companies across different scales. Its scalability is evident in multiple dimensions`
    },
    services: SERVICES
};

export const BLOG_SECTION = {
    heading: {
        title: 'Let’s learn more about MSPs business. ',
        description: `TruUp boasts a highly scalable architecture, making it adaptable to the diverse and evolving needs of companies across different scales. Its scalability is evident in multiple dimensions`
    },
    posts: BLOGS_POST
};

export const CTA_SECTION = {
    heading: {
        title: 'Revolutionise Your Finances, Foster Trust, and Boost Operational Efficiency in One Solution!',
        description: `Sign up for TruUp to revolutionise your company's financial operations. Unlock unprecedented precision by aligning software usage with billing, foster trust with clients through transparent transactions, and boost operational efficiency by eliminating revenue leakages and billing errors. TruUp is the key to achieving unparalleled financial accuracy, enhancing credibility, and freeing up resources for delivering exceptional services and driving business growth.`
    },
    link: {
        label: 'let’s talk with us',
        url: '/landing/contact-us'
    }
};
export const PRICE_PLAN_SECTION = {
    heading: {
        title: 'TruUp Pricing',
        description:
            'TruUp pricing is a dynamic and transparent model that ensures fair and accurate charges by adjusting costs in real-time based on usage, providing businesses with flexibility and cost optimization. Streamlining invoicing, TruUp aligns pricing with actual consumption, fostering financial transparency and efficiency.'
    },
    plans: [
        {
            id: 1,
            name: 'Free trial',
            description: 'Early Access',
            price: {
                monthly: '14-days free trial',
                yearly: '14-days free trial'
            },
            actionButton: {
                label: 'Contact Sales',
                url: '/landing/contact-us'
            },
            features: [
                'Single tenant',
                'Up to 5 API Connectors',
                'Up to 3 users',
                'Customer Support'
            ]
        },
        {
            id: 2,
            name: 'Professional',
            description: 'Recommended',
            price: {
                monthly: '$29.99',
                yearly: '$299'
            },
            actionButton: {
                label: 'Contact Sales',
                url: '/landing/contact-us'
            },
            features: [
                'Single tenant',
                'on-boarding support',
                'Unlimited API Connectors',
                'Up to 20 users',
                'Customer Support',
                'Custom API connectors support',
                'Elevated customer support'
            ]
        },

        {
            id: 3,
            name: 'MSP',
            description: 'Enterprise',
            price: {
                monthly: '$9.99/Tenant',
                yearly: '$99/Tenant'
            },
            actionButton: {
                label: 'Contact Sales',
                url: '/landing/contact-us'
            },
            features: [
                'Multi-tenant',
                'on-boarding support',
                'Unlimited API Connectors',
                'Unlimited users',
                'Customer Support',
                'Custom API connectors Support',
                'Elevated customer Support'
            ]
        }
    ]
};
