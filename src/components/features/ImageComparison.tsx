'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Eye, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { formatBytes } from '@/lib/utils';
import { ProcessedImageResult, ImageMetadata } from '@/core/types';

export interface ImageComparisonProps {
  originalMetadata: ImageMetadata;
  originalPreviewUrl: string;
  result: ProcessedImageResult;
  onDownload: () => void;
  onReset: () => void;
  title?: string;
}

export function ImageComparison({
  originalMetadata,
  originalPreviewUrl,
  result,
  onDownload,
  onReset,
  title = 'Processing Complete',
}: ImageComparisonProps) {
  const [activeTab, setActiveTab] = useState<'both' | 'processed' | 'original'>('both');

  const originalSize = originalMetadata.sizeBytes;
  const processedSize = result.sizeBytes;
  const sizeDiff = processedSize - originalSize;
  const percentChange = ((sizeDiff / originalSize) * 100).toFixed(1);
  const isReduced = sizeDiff < 0;

  const originalExt = originalMetadata.mimeType.replace('image/', '').toUpperCase();
  const processedExt = result.mimeType.replace('image/', '').toUpperCase();

  return (
    <Card className="border-blue-200 dark:border-blue-900/60 shadow-md">
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Processed locally in browser memory. Ready for download.
              </p>
            </div>
          </div>

          {/* View toggle for mobile or focused inspection */}
          <div className="flex items-center gap-1 self-start sm:self-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('processed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'processed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Output Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'original'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Original Only
            </button>
          </div>
        </div>

        {/* Comparison Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Original Size
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {formatBytes(originalSize)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Output Size
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatBytes(processedSize)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Difference
            </span>
            <div className="flex items-center gap-1">
              {isReduced ? (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {percentChange}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{percentChange}%
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Dimensions
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {result.width} × {result.height}
            </span>
          </div>
        </div>

        {/* Image Preview Panels */}
        <div
          className={`grid gap-4 ${
            activeTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Original Preview */}
          {(activeTab === 'both' || activeTab === 'original') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Original Image
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" size="sm">
                    {originalExt}
                  </Badge>
                  <span className="text-slate-400 dark:text-slate-500">
                    {originalMetadata.width}×{originalMetadata.height}
                  </span>
                </div>
              </div>
              <div className="relative aspect-video max-h-[360px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2">
                {/* Transparency pattern background */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #888888 10%, transparent 11%)',
                    backgroundSize: '12px 12px',
                  }}
                />
                <img
                  src={originalPreviewUrl}
                  alt="Original input"
                  className="max-h-full max-w-full object-contain rounded z-10"
                />
              </div>
            </div>
          )}

          {/* Processed Output Preview */}
          {(activeTab === 'both' || activeTab === 'processed') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Processed Output</span>
                  <Badge variant="success" size="sm">
                    {processedExt}
                  </Badge>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {result.width}×{result.height} • {formatBytes(result.sizeBytes)}
                </span>
              </div>
              <div className="relative aspect-video max-h-[360px] w-full overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #888888 10%, transparent 11%)',
                    backgroundSize: '12px 12px',
                  }}
                />
                <img
                  src={result.objectUrl}
                  alt="Processed result"
                  className="max-h-full max-w-full object-contain rounded z-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Process Another Image
          </Button>

          <Button
            variant="primary"
            onClick={onDownload}
            className="w-full sm:w-auto shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download {processedExt} ({formatBytes(result.sizeBytes)})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
