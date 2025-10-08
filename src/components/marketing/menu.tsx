"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { BookOpen, Brain, Globe, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Icons from "../global/icons";

interface Props {
    title: string;
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const Menu = () => {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Home
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                        Test
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[500px]">
                            <TestItem title="Comprehensive Assessment" testType="assessment" icon={<BookOpen className="w-5 h-5" />}>
                                54-question test to evaluate overall study abroad readiness. (20–25 mins)
                            </TestItem>
                            <TestItem title="Expanded Assessment" testType="expanded" icon={<Brain className="w-5 h-5" />}>
                                42 questions covering academic, emotional, and financial aspects. (15–20 mins)
                            </TestItem>
                            <TestItem title="Focused Assessment" testType="concise" icon={<Globe className="w-5 h-5" />}>
                                25 questions to measure readiness across key areas. (10–12 mins)
                            </TestItem>
                            <TestItem title="Quick Check" testType="ultraquick" icon={<GraduationCap className="w-5 h-5" />}>
                                12 quick questions for an instant readiness snapshot. (3–5 mins)
                            </TestItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('psychometric-test');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Services
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('perks');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Perks
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('testimonials');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Testimonials
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
};

const Item = ({ title, href, children, icon, ...props }: Props) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    passHref
                    href={href}
                    {...props}
                    className="grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                >
                    <div className="flex items-center mt-1 justify-center p-1 w-8 h-8 rounded-md border border-border/80">
                        {icon}
                    </div>
                    <div className="text-start ml-3">
                        <span className="text-sm group-hover:text-foreground font-normal leading-none">
                            {title}
                        </span>
                        <p className="text-sm mt-0.5 line-clamp-2 text-muted-foreground">
                            {children}
                        </p>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
};

const TestItem = ({ title, testType, children, icon }: { title: string; testType: string; children: React.ReactNode; icon: React.ReactNode }) => {
    const handleTestClick = () => {
        // First scroll to the section
        const element = document.getElementById('psychometric-test');
        element?.scrollIntoView({ behavior: 'smooth' });
        
        // Then trigger the appropriate test after a short delay
        setTimeout(() => {
            const event = new CustomEvent('openTest', { detail: { testType } });
            window.dispatchEvent(event);
        }, 800);
    };

    return (
        <li>
            <NavigationMenuLink asChild>
                <button
                    onClick={handleTestClick}
                    className="grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group w-full text-left"
                >
                    <div className="flex items-center mt-1 justify-center p-1 w-8 h-8 rounded-md border border-border/80">
                        {icon}
                    </div>
                    <div className="text-start ml-3">
                        <span className="text-sm group-hover:text-foreground font-normal leading-none">
                            {title}
                        </span>
                        <p className="text-sm mt-0.5 line-clamp-2 text-muted-foreground">
                            {children}
                        </p>
                    </div>
                </button>
            </NavigationMenuLink>
        </li>
    )
};

Item.displayName = "Item";

export default Menu
