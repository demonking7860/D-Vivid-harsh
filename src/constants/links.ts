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
            { name: "Study in USA", href: "https://www.dvividconsultant.com/Study-in-USA" },
            { name: "Study in Canada", href: "https://www.dvividconsultant.com/Study-in-Canada" },
            { name: "Study in Australia", href: "https://www.dvividconsultant.com/Study-in-Australia" },
            { name: "Study in UK", href: "https://www.dvividconsultant.com/Study-in-UK" },
            { name: "Study in Germany", href: "https://www.dvividconsultant.com/Study-in-Germany" },
        ],
    },
    {
        title: "Courses",
        links: [
            { name: "PTE", href: "https://course.dvividconsultant.com/course/complete-pte-course" },
            { name: "IELTS", href: "https://course.dvividconsultant.com/course/complete-ielts-course" },
            { name: "TOEFL", href: "https://course.dvividconsultant.com/classes" },
            { name: "Duolingo", href: "https://course.dvividconsultant.com/course/complete-duolingo-course" },
        ],
    },
    {
        title: "Consultants",
        links: [
            { name: "Study Abroad Consultant in Surat", href: "https://www.dvividconsultant.com/study-abroad-consultants-in-surat" },
            { name: "Study Abroad Consultant in Ahmedabad", href: "https://www.dvividconsultant.com/study-abroad-consultants-in-ahmedabad" },
        ],
    },
];
