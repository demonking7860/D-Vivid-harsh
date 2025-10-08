import { ClockIcon, MessageSquare, BarChart2, FileTextIcon, UserPlusIcon, CreditCardIcon, SettingsIcon, LogOut, Headphones, ChartPieIcon, LucideIcon, MessagesSquareIcon, NewspaperIcon, MegaphoneIcon, LineChartIcon, MessageSquareTextIcon, UsersIcon } from 'lucide-react';

type Link = {
    href: string;
    label: string;
    icon: LucideIcon;
}

export const SIDEBAR_LINKS: Link[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: ChartPieIcon,
    },
    {
        href: "/dashboard/campaigns",
        label: "Campaigns",
        icon: MegaphoneIcon
    },
    {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: LineChartIcon
    },
    {
        href: "/dashboard/posts",
        label: "Posts",
        icon: MessageSquareTextIcon
    },
    {
        href: "/dashboard/engagement",
        label: "Engagement",
        icon: UsersIcon
    },
    {
        href: "/dashboard/billing",
        label: "Billing",
        icon: CreditCardIcon
    },
    {
        href: "/dashboard/settings",
        label: "Settings",
        icon: SettingsIcon
    },
];

export const FOOTER_LINKS = [
    {
        title: "STUDY ABROAD",
        links: [
            { name: "Study in USA", href: "/study/usa" },
            { name: "Study in Canada", href: "/study/canada" },
            { name: "Study in Australia", href: "/study/australia" },
            { name: "Study in UK", href: "/study/uk" },
            { name: "Study in Germany", href: "/study/germany" },
        ],
    },
    {
        title: "Courses",
        links: [
            { name: "PTE", href: "/courses/pte" },
            { name: "IELTS", href: "/courses/ielts" },
            { name: "TOEFL", href: "/courses/toefl" },
            { name: "Duolingo", href: "/courses/duolingo" },
        ],
    },
    {
        title: "Consultants",
        links: [
            { name: "Study Abroad Consultant in Surat", href: "/consultants/surat" },
            { name: "Study Abroad Consultant in Ahmedabad", href: "/consultants/ahmedabad" },
        ],
    },
];
