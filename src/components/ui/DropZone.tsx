'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export interface DropZoneProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
}

export function DropZone({
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp',
  disabled = false,
  className,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload an image to process"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 outline-none cursor-pointer select-none',
        isDragOver
          ? 'border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/20 scale-[1.01]'
          : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/60',
        disabled ? 'pointer-events-none opacity-50' : 'focus-visible:ring-2 focus-visible:ring-blue-500',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-105 dark:bg-blue-950 dark:text-blue-400 mb-4 shadow-sm">
        <UploadCloud className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
        Drop your image here, or{' '}
        <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-4">
          browse
        </span>
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        Supports JPG, PNG, and WebP up to 8192px.
      </p>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>100% Client-Side • No server uploads</span>
      </div>
    </div>
  );
}
