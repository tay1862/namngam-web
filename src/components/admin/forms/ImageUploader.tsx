'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  folder?: string;
  onUploadComplete?: (url: string, mediaId: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export default function ImageUploader({
  folder = 'general',
  onUploadComplete,
  maxSizeMB = 5,
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Image uploaded successfully!');
        setUploadedUrl(result.data.url);
        if (onUploadComplete) {
          onUploadComplete(result.data.url, result.data.id);
        }
      } else {
        toast.error(result.error || 'Failed to upload image');
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl(null);
  };

  return (
    <div className={className}>
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
              <Upload size={32} className="text-pink-500" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF, WebP up to {maxSizeMB}MB
              </p>
            </div>

            <Button type="button" variant="secondary" disabled={isUploading}>
              <ImageIcon size={18} />
              Choose Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
          <div className="relative aspect-video bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>

          <div className="absolute top-2 right-2 flex gap-2">
            {uploadedUrl && (
              <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Check size={16} />
                Uploaded
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4">
                <div className="spinner mx-auto mb-2"></div>
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
