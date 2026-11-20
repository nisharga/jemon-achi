import { SOCIAL_MEDIAS } from './HomeFeaturesList';

export * from './homePage';

export const MENUS = [
    {
        id: 1,
        label: 'Connectors',
        route: '/landing#connectors',
        isButton: false
    },
    {
        id: 2,
        label: 'Features',
        route: '/landing#features',
        isButton: false
    },
    {
        id: 3,
        label: 'Pricing',
        route: '/landing#pricing',
        isButton: false
    },
    {
        id: 4,
        label: 'Contact Sales',
        route: '/landing/contact-us',
        isButton: true
    }
];

export const FOOTER_SECTION = {
    title: 'Join our newsletter',
    description:
        'Stay up to date on TruUp, the automated software asset management built specifically for MSPs.',
    socialMedias: {
        heading: 'Follow Us.',
        links: SOCIAL_MEDIAS
    },
    widgets: [
        {
            heading: 'Quick Links',
            links: [
                {
                    label: 'Connectors',
                    url: '/landing#connectors'
                },
                {
                    label: 'Features',
                    url: '/landing#features'
                },
                {
                    label: 'Pricing',
                    url: '/landing#pricing'
                },
                {
                    label: 'Contact Sales',
                    url: '/landing/contact-us'
                }
            ]
        }
    ]
};
