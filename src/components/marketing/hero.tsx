"use client";

import { ArrowRightIcon, PlayIcon, PauseIcon } from "lucide-react";
import Link from "next/link";
import { BlurText } from "../ui/blur-text";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../global/container";
import { useState, useEffect } from "react";
import ConsultationCard from "./consultation-card";

const expertise = [
    "Profile Evaluation",
    "University & Course Selection", 
    "Test Preparation",
    "University Application",
    "Visa Interview Preparation",
    "Scholarships & Funding Guidance"
];

const TypewriterEffect = () => {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        const currentWord = expertise[wordIndex];
        
        const timer = setTimeout(() => {
            if (!isDeleting && index < currentWord.length) {
                setText(currentWord.substring(0, index + 1));
                setIndex(index + 1);
            } else if (isDeleting && index > 0) {
                setText(currentWord.substring(0, index - 1));
                setIndex(index - 1);
            } else if (!isDeleting && index === currentWord.length) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && index === 0) {
                setIsDeleting(false);
                setWordIndex((wordIndex + 1) % expertise.length);
            }
        }, isDeleting ? 50 : 100);
        
        return () => clearTimeout(timer);
    });
    
    return (
        <span className="text-purple-400">
            {text}
            <span className="animate-pulse text-purple-500 ml-1">|</span>
        </span>
    );
};

const YouTubeVideoPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = "6WFdYcyOlPc"; // Extracted from the YouTube URL
    
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };
    
    if (!isPlaying) {
        return (
            <div className="relative cursor-pointer group" onClick={togglePlay}>
                <Image
                    src="/images/yt_front.jpg"
                    alt="Video Thumbnail"
                    width={1920}
                    height={1080}
                    className="rounded-lg lg:rounded-[20px] w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-4 group-hover:bg-black/80 transition-colors duration-300">
                        <PlayIcon className="w-12 h-12 text-white ml-1" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-lg lg:rounded-[20px] group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
        );
    }
    
    return (
        <div className="relative">
            <iframe
                width="100%"
                height="540"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg lg:rounded-[20px] w-full aspect-video"
            ></iframe>
            <button
                onClick={togglePlay}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors duration-300"
            >
                <PauseIcon className="w-6 h-6 text-white" />
            </button>
        </div>
    );
};

const Hero = () => {
    const [openConsultation, setOpenConsultation] = useState(false);

    return (
        <div className="flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative">
            <Container delay={0.0}>
                <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        </div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-clip-text text-sm text-transparent">
                        The most trusted consultant in India
                        <span className="text-xs text-secondary-foreground px-1.5 py-0.5 rounded-full bg-gradient-to-b from-foreground/20 to-foreground/10 flex items-center justify-center">
                            Trusted
                            <ArrowRightIcon className="w-3.5 h-3.5 ml-1 text-foreground/50" />
                        </span>
                    </span>
                </div>
            </Container>
            <div className="mt-6">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] font-heading">
                    Study Abroad with D-Vivid
                </h1>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] font-heading mt-2">
                    Expert in <TypewriterEffect />
                </div>
            </div>
            <Container delay={0.1}>
                <p className="text-sm sm:text-base lg:text-lg mt-4 text-accent-foreground/60 max-w-2xl mx-auto">
                    Trusted by 5,000+ students across 6 countries with 1,200+ universities worldwide.
                </p>
            </Container>
            <Container delay={0.2}>
                <div className="flex items-center justify-center mt-8">
                    <Button onClick={() => setOpenConsultation(true)} size="lg" className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white px-8 py-6 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105">
                        Book a Free Consultation
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </Container>
            <Container delay={0.3}>
                <div className="relative mx-auto max-w-7xl rounded-xl lg:rounded-[32px] border border-neutral-200/50 p-2 backdrop-blur-lg border-neutral-700 bg-neutral-800/50 md:p-4 mt-12">
                    <div className="absolute top-1/4 left-1/2 -z-10 gradient w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem]"></div>

                    <div className="rounded-lg lg:rounded-[24px] border p-2 border-neutral-700 bg-black">
                        <YouTubeVideoPlayer />
                    </div>
                </div>
            </Container>

            {/* Consultation Dialog */}
            <ConsultationCard open={openConsultation} onOpenChange={setOpenConsultation} />
        </div>
    )
};

export default Hero
