'use client';

import { forwardRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { AI_TOOLS } from '@/lib/constants';
import UploadDropzone from './UploadDropzone';
import SuccessState from './SuccessState';

interface FormData {
  title: string;
  artistName: string;
  artistStatement: string;
  aiTool: string;
  prompt: string;
  tags: string;
  agreed: boolean;
}

interface FormErrors {
  title?: string;
  artistName?: string;
  artistStatement?: string;
  aiTool?: string;
  tags?: string;
  file?: string;
  agreed?: string;
  submit?: string;
}

const initialFormData: FormData = {
  title: '',
  artistName: 'Anonymous',
  artistStatement: '',
  aiTool: '',
  prompt: '',
  tags: '',
  agreed: false,
};

const SubmissionForm = forwardRef<HTMLFormElement, { className?: string }>(
  ({ className }, ref) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successSlug, setSuccessSlug] = useState<string | null>(null);

    const updateField = useCallback(
      <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined, submit: undefined }));
      },
      []
    );

    const handleFileSelect = useCallback((selectedFile: File) => {
      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: undefined }));

      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }, []);

    const validate = useCallback((): FormErrors => {
      const errs: FormErrors = {};

      if (!formData.title.trim()) {
        errs.title = 'Title is required';
      } else if (formData.title.length > 100) {
        errs.title = 'Title must be 100 characters or fewer';
      }

      if (!formData.artistName.trim()) {
        errs.artistName = 'Artist name is required';
      } else if (formData.artistName.length > 60) {
        errs.artistName = 'Artist name must be 60 characters or fewer';
      }

      if (formData.artistStatement.length > 2000) {
        errs.artistStatement = 'Artist statement must be 2000 characters or fewer';
      }

      if (!formData.aiTool) {
        errs.aiTool = 'Please select the AI tool used';
      }

      if (formData.tags) {
        const tagList = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
        if (tagList.length > 5) {
          errs.tags = 'Maximum 5 tags allowed';
        }
      }

      if (!file) {
        errs.file = 'Please upload an image';
      }

      if (!formData.agreed) {
        errs.agreed = 'You must agree to the terms';
      }

      return errs;
    }, [formData, file]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
          // Step 1: Upload the image
          const uploadData = new FormData();
          uploadData.append('file', file);

          setUploadProgress(10);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
          });

          if (!uploadRes.ok) {
            const uploadErr = await uploadRes.json().catch(() => ({}));
            throw new Error(uploadErr.error || 'Image upload failed');
          }

          setUploadProgress(60);

          const { imagePath, thumbnailPath, dominantColor, width, height } =
            await uploadRes.json();

          // Step 2: Submit artwork metadata
          const artworkRes = await fetch('/api/artworks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title.trim(),
              artistName: formData.artistName.trim(),
              artistStatement: formData.artistStatement.trim() || undefined,
              aiTool: formData.aiTool,
              prompt: formData.prompt.trim() || undefined,
              tags: formData.tags
                ? formData.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .join(',')
                : undefined,
              imagePath,
              thumbnailPath,
              dominantColor,
              width,
              height,
            }),
          });

          setUploadProgress(90);

          if (!artworkRes.ok) {
            const artworkErr = await artworkRes.json().catch(() => ({}));
            throw new Error(artworkErr.error || 'Failed to save artwork');
          }

          const { slug } = await artworkRes.json();

          setUploadProgress(100);
          setSuccessSlug(slug);
        } catch (err) {
          setErrors({
            submit:
              err instanceof Error
                ? err.message
                : 'Something went wrong. Please try again.',
          });
        } finally {
          setIsUploading(false);
        }
      },
      [file, formData, validate]
    );

    if (successSlug) {
      return <SuccessState artworkSlug={successSlug} />;
    }

    return (
      <motion.form
        ref={ref}
        onSubmit={handleSubmit}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className={cn('space-y-6', className)}
        noValidate
      >
        {/* Image Upload */}
        <motion.div variants={fadeUp}>
          <label className="mb-2 block font-body text-body-sm font-medium text-ivory-200">
            Artwork Image <span className="text-amber">*</span>
          </label>
          <UploadDropzone
            onFileSelect={handleFileSelect}
            preview={preview}
            isUploading={isUploading}
            progress={uploadProgress}
          />
          {errors.file && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.file}
            </p>
          )}
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="title"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            Title <span className="text-amber">*</span>
          </label>
          <input
            id="title"
            type="text"
            maxLength={100}
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Name your artwork"
            className={cn(
              'w-full rounded-lg border bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'placeholder:text-ivory-400 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950',
              errors.title ? 'border-error' : 'border-void-700'
            )}
          />
          {errors.title && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.title}
            </p>
          )}
        </motion.div>

        {/* Artist Name */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="artistName"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            Artist Name <span className="text-amber">*</span>
          </label>
          <input
            id="artistName"
            type="text"
            maxLength={60}
            value={formData.artistName}
            onChange={(e) => updateField('artistName', e.target.value)}
            placeholder="Anonymous"
            className={cn(
              'w-full rounded-lg border bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'placeholder:text-ivory-400 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950',
              errors.artistName ? 'border-error' : 'border-void-700'
            )}
          />
          {errors.artistName && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.artistName}
            </p>
          )}
        </motion.div>

        {/* Artist Statement */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="artistStatement"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            Artist Statement
          </label>
          <textarea
            id="artistStatement"
            maxLength={2000}
            rows={4}
            value={formData.artistStatement}
            onChange={(e) => updateField('artistStatement', e.target.value)}
            placeholder="Tell us about your creative process..."
            className={cn(
              'w-full resize-y rounded-lg border bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'placeholder:text-ivory-400 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950',
              errors.artistStatement ? 'border-error' : 'border-void-700'
            )}
          />
          <div className="mt-1 flex justify-between">
            {errors.artistStatement ? (
              <p className="font-body text-body-sm text-error" role="alert">
                {errors.artistStatement}
              </p>
            ) : (
              <span />
            )}
            <span className="font-mono text-mono-sm text-ivory-400">
              {formData.artistStatement.length}/2000
            </span>
          </div>
        </motion.div>

        {/* AI Tool */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="aiTool"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            AI Tool Used <span className="text-amber">*</span>
          </label>
          <select
            id="aiTool"
            value={formData.aiTool}
            onChange={(e) => updateField('aiTool', e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950',
              !formData.aiTool && 'text-ivory-400',
              errors.aiTool ? 'border-error' : 'border-void-700'
            )}
          >
            <option value="" disabled>
              Select an AI tool
            </option>
            {AI_TOOLS.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
          {errors.aiTool && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.aiTool}
            </p>
          )}
        </motion.div>

        {/* Prompt */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="prompt"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            maxLength={5000}
            rows={3}
            value={formData.prompt}
            onChange={(e) => updateField('prompt', e.target.value)}
            placeholder="Share the prompt used to create this artwork..."
            className={cn(
              'w-full resize-y rounded-lg border border-void-700 bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'placeholder:text-ivory-400 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950'
            )}
          />
        </motion.div>

        {/* Tags */}
        <motion.div variants={fadeUp}>
          <label
            htmlFor="tags"
            className="mb-2 block font-body text-body-sm font-medium text-ivory-200"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            placeholder="abstract, portrait, landscape (max 5, comma-separated)"
            className={cn(
              'w-full rounded-lg border bg-void-800 px-4 py-2.5 font-body text-body-md text-ivory-100',
              'placeholder:text-ivory-400 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950',
              errors.tags ? 'border-error' : 'border-void-700'
            )}
          />
          {errors.tags && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.tags}
            </p>
          )}
        </motion.div>

        {/* Agreement */}
        <motion.div variants={fadeUp}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreed}
              onChange={(e) => updateField('agreed', e.target.checked)}
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 rounded border-void-600 bg-void-800',
                'text-amber accent-amber',
                'focus:ring-2 focus:ring-amber focus:ring-offset-1 focus:ring-offset-void-950'
              )}
            />
            <span className="font-body text-body-sm text-ivory-300">
              I confirm this artwork was created with AI assistance and I have the right
              to share it. I agree to it being displayed in the Aether gallery.
            </span>
          </label>
          {errors.agreed && (
            <p className="mt-1.5 font-body text-body-sm text-error" role="alert">
              {errors.agreed}
            </p>
          )}
        </motion.div>

        {/* Submit error */}
        {errors.submit && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-lg border border-error/30 bg-error/10 px-4 py-3"
            role="alert"
          >
            <p className="font-body text-body-sm text-error">{errors.submit}</p>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.div variants={fadeUp}>
          <button
            type="submit"
            disabled={isUploading}
            className={cn(
              'inline-flex h-12 w-full items-center justify-center rounded-lg bg-amber px-8',
              'font-body text-body-md font-medium text-void-950',
              'transition-colors duration-300 ease-glacial hover:bg-amber-light',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isUploading ? 'Uploading...' : 'Submit to Collection'}
          </button>
        </motion.div>
      </motion.form>
    );
  }
);
SubmissionForm.displayName = 'SubmissionForm';

export default SubmissionForm;
