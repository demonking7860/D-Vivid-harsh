"use client";
import { cn } from "@/functions";
import React, { useRef } from "react";

export const BackgroundBeams = React.memo(function BackgroundBeams({
  className,
}: {
  className?: string;
}) {
  const beams = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={beams}
      className={cn(
        "absolute inset-0 h-full w-full opacity-60 pointer-events-none",
        className
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
      >
        <g clipPath="url(#clip)">
          <g filter="url(#filter)">
            <circle cx="168" cy="106" r="90" stroke="white" strokeWidth="0.5" />
            <circle cx="400" cy="200" r="90" stroke="white" strokeWidth="0.5" />
            <circle cx="600" cy="100" r="90" stroke="white" strokeWidth="0.5" />
          </g>
        </g>
        <defs>
          <filter
            id="filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
          >
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <clipPath id="clip">
            <rect width="696" height="316" />
          </clipPath>
        </defs>
      </svg>

      {/* Large central beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 opacity-40 blur-[120px] animate-pulse" />
      </div>
      
      {/* Multiple smaller beams */}
      <div className="absolute top-1/4 left-1/4">
        <div className="h-64 w-64 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30 blur-[100px] animate-pulse animation-delay-1000" />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4">
        <div className="h-48 w-48 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-35 blur-[80px] animate-pulse animation-delay-2000" />
      </div>
      
      <div className="absolute top-3/4 left-1/6">
        <div className="h-40 w-40 rounded-full bg-gradient-to-r from-green-500 to-teal-500 opacity-25 blur-[70px] animate-pulse animation-delay-3000" />
      </div>
      
      <div className="absolute bottom-1/6 right-1/3">
        <div className="h-56 w-56 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-20 blur-[90px] animate-pulse animation-delay-4000" />
      </div>
      
      {/* Animated light rays */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 h-20 w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-30 rotate-12 animate-pulse" />
        <div className="absolute top-1/4 -right-5 h-32 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-25 rotate-45 animate-pulse animation-delay-1500" />
        <div className="absolute bottom-1/4 -left-5 h-24 w-1 bg-gradient-to-b from-transparent via-pink-400 to-transparent opacity-20 -rotate-12 animate-pulse animation-delay-2500" />
      </div>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";