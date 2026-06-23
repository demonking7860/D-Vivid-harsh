"use client";

import { cn } from "@/functions";
import { useClerk } from "@clerk/nextjs";
import { ArrowRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import Menu from "./menu";
import MobileMenu from "./mobile-menu";

const Navbar = () => {

    const { user } = useClerk();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);


    return (
        <div className="relative w-full h-full">
            <div className="z-[99] fixed pointer-events-none inset-x-0 h-[88px] bg-[rgba(10,10,10,0.8)] backdrop-blur-sm [mask:linear-gradient(to_bottom,#000_20%,transparent_calc(100%-20%))]"></div>

            <header
                className={cn(
                    "fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-[100] transform th",
                    isOpen ? "h-[calc(100%-24px)]" : "h-12"
                )}
            >
                <Wrapper className="backdrop-blur-lg rounded-xl lg:rounded-2xl border border-white/60 bg-[linear-gradient(180deg,#fafafb_0%,#e4e4ea_48%,#c4c4cd_100%)] shadow-[0_6px_24px_-10px_rgba(124,58,237,0.45)] px- md:px-2 flex items-center justify-start transition-all duration-300 ease-out hover:shadow-[0_10px_34px_-8px_rgba(124,58,237,0.6)] hover:border-primary/40">
                    <div className="flex items-center justify-between w-full sticky mt-[7px] lg:mt-auto mb-auto inset-x-0">
                        <div className="flex items-center flex-1 lg:flex-none pl-1">
                            <Link href="/" className="text-lg font-semibold text-foreground">
                                <Image
                                    src="/d-vivid-logo.png"
                                    alt="D-VIVID Consultant"
                                    width={180}
                                    height={48}
                                    priority
                                    className="w-auto h-7 lg:h-9 object-contain transition-transform duration-300 ease-out hover:scale-105"
                                />
                            </Link>
                            <div className="items-center hidden ml-4 lg:flex">
                                <Menu />
                            </div>
                        </div>
                        <div className="items-center flex gap-2 lg:gap-4">
                            <Button size="sm" variant="default" onClick={scrollToContact} className="hidden sm:flex transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(124,58,237,0.7)]">
                                Contact us
                                <ArrowRightIcon className="w-4 h-4 ml-2 hidden lg:block transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="lg:hidden p-2 w-8 h-8 text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                {isOpen ? <XIcon className="w-4 h-4 duration-300" /> : <Icons.menu className="w-3.5 h-3.5 duration-300" />}
                            </Button>
                        </div>
                    </div>
                    <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
                </Wrapper>
            </header>

        </div>
    )
};

export default Navbar
