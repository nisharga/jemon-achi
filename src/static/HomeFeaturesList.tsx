import { Icons } from '@/components/Icons';

export const HERO_FEATURES = [
    {
        id: '1',
        label: 'Planning',
        icon: <Icons.Newspaper width={24} height={24} />
    },
    {
        id: '2',
        label: 'Prebuilt Connectors',
        icon: <Icons.Connector width={24} height={24} />
    },
    {
        id: '3',
        label: 'Multi-tenant capabilities',
        icon: <Icons.MultiTanent className='h-5 w-5' width={20} height={20} />
    },
    {
        id: '4',
        label: 'Resource Management',
        icon: <Icons.Stack width={24} height={24} />
    },
    {
        id: '5',
        label: 'Reports',
        icon: <Icons.Report className='h-5 w-5' width={24} height={24} />
    },
    {
        id: '6',
        label: 'Sales',
        icon: <Icons.Sales className='h-5 w-5' width={20} height={20} />
    },
    {
        id: '7',
        label: 'API Management',
        icon: <Icons.Database className='h-5 w-5' width={24} height={24} />
    },
    {
        id: '8',
        label: 'Custom API Integrations',
        icon: <Icons.Link width={24} height={24} className='h-5 w-5' />
    },
    {
        id: '9',
        label: 'Budgeting',
        icon: <Icons.DollarDoc width={24} height={24} className='h-5 w-5' />
    }
];

export const SERVICES = [
    {
        id: '1',
        name: 'User Base',
        icon: (
            <Icons.UserGroup
                style={{ width: 54, height: 54, fill: '#21D191' }}
            />
        ),
        details: `TruUp effortlessly scales to accommodate the evolving user base of companies, ensuring seamless performance as the user count grows.`
    },
    {
        id: '2',
        name: 'Software Ecosystem',
        icon: <Icons.Stack style={{ width: 44, height: 44 }} />,
        details: `With dynamic API connections, TruUp easily integrates with a variety of software platforms, adapting to changes in the company's software ecosystem and evolving technology landscape.`
    },
    {
        id: '3',
        name: 'Transaction Volume',
        icon: <Icons.CircularProcess style={{ width: 54, height: 54 }} />,
        details: `TruUp handles increased transaction volumes efficiently, maintaining precision and efficiency as companies scale their operations and financial transactions become more complex.`
    },
    {
        id: '4',
        name: 'Adaptable Architecture',
        icon: <Icons.NiceHand style={{ width: 60, height: 60 }} />,
        details: `TruUp's adaptable architecture allows for custom integrations, ensuring scalability in diverse and specialized environments by tailoring the solution to the unique needs of each company.`
    }
];

export const SOCIAL_MEDIAS = [
    {
        name: 'Facebook',
        url: 'https://www.facebook.com/truup.io',
        icon: <Icons.FacebookCircle />
    },
    {
        name: 'Linkedin',
        url: 'https://www.linkedin.com/company/truup/about/',
        icon: <Icons.LinkedinFill />
    }
];
