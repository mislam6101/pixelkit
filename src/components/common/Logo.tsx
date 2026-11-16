import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer framing corner guides (Precision / Viewfinder) */}
      <path
        d="M4 11V6C4 4.89543 4.89543 4 6 4H11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-blue-500/60 dark:text-blue-400/50"
      />
      <path
        d="M32 11V6C32 4.89543 31.1046 4 30 4H25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-blue-500/60 dark:text-blue-400/50"
      />
      <path
        d="M4 25V30C4 31.1046 4.89543 32 6 32H11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-blue-500/60 dark:text-blue-400/50"
      />
      <path
        d="M32 25V30C32 31.1046 31.1046 32 30 32H25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-blue-500/60 dark:text-blue-400/50"
      />

      {/* Primary Pixel Grid (Precision Geometry) */}
      {/* Top-Left: Solid Vibrant Primary Pixel */}
      <rect
        x="9"
        y="9"
        width="8"
        height="8"
        rx="2"
        fill="url(#pk-grad-1)"
      />
      {/* Top-Right: Translucent Accent Pixel (Transformation) */}
      <rect
        x="19"
        y="9"
        width="8"
        height="8"
        rx="2"
        fill="url(#pk-grad-2)"
      />
      {/* Bottom-Left: Cyan Tone Pixel */}
      <rect
        x="9"
        y="19"
        width="8"
        height="8"
        rx="2"
        fill="url(#pk-grad-3)"
      />
      {/* Bottom-Right: Core High-Density Pixel */}
      <rect
        x="19"
        y="19"
        width="8"
        height="8"
        rx="2"
        fill="url(#pk-grad-4)"
      />

      {/* Center Precision Focal Point */}
      <circle cx="18" cy="18" r="1.5" fill="white" className="dark:fill-slate-900" />

      {/* Gradients Definition */}
      <defs>
        <linearGradient id="pk-grad-1" x1="9" y1="9" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="pk-grad-2" x1="19" y1="9" x2="27" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="pk-grad-3" x1="9" y1="19" x2="17" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="pk-grad-4" x1="19" y1="19" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E40AF" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className,
  iconOnly = false,
  size = 'md',
}: LogoProps) {
  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size];

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className="flex shrink-0 items-center justify-center">
        <LogoMark className={iconSizeClasses} />
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight text-slate-900 dark:text-slate-100', textSizeClasses)}>
            Photo<span className="text-blue-600 dark:text-blue-400">Kit</span>
          </span>
          <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">
            Client-Side Image Studio
          </span>
        </div>
      )}
    </div>
  );
}
