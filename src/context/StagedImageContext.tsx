'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface StagedImageContextType {
  stagedFile: File | null;
  stageFile: (file: File) => void;
  consumeStagedFile: () => File | null;
  clearStagedFile: () => void;
}

const StagedImageContext = createContext<StagedImageContextType | undefined>(undefined);

export interface StagedImageProviderProps {
  children: React.ReactNode;
}

export function StagedImageProvider({ children }: StagedImageProviderProps) {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const stagedFileRef = useRef<File | null>(null);

  const stageFile = useCallback((file: File) => {
    if (!file || !(file instanceof File)) {
      return;
    }
    stagedFileRef.current = file;
    setStagedFile(file);
  }, []);

  const consumeStagedFile = useCallback((): File | null => {
    const file = stagedFileRef.current;
    if (file) {
      stagedFileRef.current = null;
      setStagedFile(null);
    }
    return file;
  }, []);

  const clearStagedFile = useCallback(() => {
    stagedFileRef.current = null;
    setStagedFile(null);
  }, []);

  return (
    <StagedImageContext.Provider
      value={{
        stagedFile,
        stageFile,
        consumeStagedFile,
        clearStagedFile,
      }}
    >
      {children}
    </StagedImageContext.Provider>
  );
}

export function useStagedImage(): StagedImageContextType {
  const context = useContext(StagedImageContext);
  if (!context) {
    throw new Error('useStagedImage must be used within a StagedImageProvider');
  }
  return context;
}
