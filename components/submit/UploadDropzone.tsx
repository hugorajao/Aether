'use client';

import { forwardRef, useCallback, useRef, useState, DragEvent } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn } from '@/lib/motion';
import { ACCEPTED_EXTENSIONS, ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  preview?: string | null;
  isUploading?: boolean;
  progress?: number;
  className?: string;
}

const UploadDropzone = forwardRef<HTMLDivElement, UploadDropzoneProps>(
  ({ onFileSelect, preview, isUploading = false, progress = 0, className }, ref) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return `Invalid file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`;
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        return `File too large. Maximum size: ${formatFileSize(MAX_UPLOAD_SIZE)}`;
      }
      return null;
    }, []);

    const handleFile = useCallback(
      (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setError(null);
        onFileSelect(file);
      },
      [validateFile, onFileSelect]
    );

    const handleDragOver = useCallback((e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      },
      [handleFile]
    );

    const handleClick = useCallback(() => {
      inputRef.current?.click();
    }, []);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset input so the same file can be re-selected
        e.target.value = '';
      },
      [handleFile]
    );

    return (
      <div ref={ref} className={cn('relative', className)}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors duration-300 ease-glacial',
            isDragOver
              ? 'border-amber bg-amber-dim'
              : 'border-void-700 hover:border-void-600',
            isUploading && 'pointer-events-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950'
          )}
          aria-label="Upload artwork image. Click or drag and drop."
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-0"
              >
                <Image
                  src={preview}
                  alt="Upload preview"
                  fill
                  className="object-contain"
                />
                {!isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-void-950/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <p className="font-body text-body-sm text-ivory-100">
                      Click to replace
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-center gap-3"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-void-800">
                  <Upload className="h-6 w-6 text-ivory-400" />
                </div>
                <div className="text-center">
                  <p className="font-body text-body-md text-ivory-200">
                    Drag and drop your artwork here
                  </p>
                  <p className="mt-1 font-body text-body-sm text-ivory-400">
                    PNG, JPG, or WebP up to {formatFileSize(MAX_UPLOAD_SIZE)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          {isUploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-void-800">
              <motion.div
                className="h-full bg-amber"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Error message */}
        {error && (
          <p className="mt-2 font-body text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
UploadDropzone.displayName = 'UploadDropzone';

export default UploadDropzone;
