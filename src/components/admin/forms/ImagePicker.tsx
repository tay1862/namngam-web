'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Media {
  id: string;
  url: string;
  originalName: string;
  width?: number;
  height?: number;
}

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  required?: boolean;
}

export default function ImagePicker({
  value,
  onChange,
  folder = 'general',
  label,
  required,
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/upload');
      const result = await response.json();
      if (result.success) {
        setMedia(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: Media) => {
    setSelectedId(item.id);
  };

  const handleConfirm = () => {
    const selected = media.find((m) => m.id === selectedId);
    if (selected) {
      onChange(selected.url);
      setIsOpen(false);
      setSelectedId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingFile(true);
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
        fetchMedia();
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {value ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
          <Image
            src={value}
            alt="Selected image"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(true)}
            >
              Change
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 transition-all flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-pink-50"
        >
          <ImageIcon size={40} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Click to select image
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Select Image</h3>
              <div className="flex gap-2">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                  <span className="btn btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm cursor-pointer">
                    <Upload size={16} />
                    {uploadingFile ? 'Uploading...' : 'Upload New'}
                  </span>
                </label>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No images yet</p>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="btn btn-primary inline-flex items-center gap-2 cursor-pointer">
                      <Upload size={18} />
                      Upload First Image
                    </span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedId === item.id
                          ? 'border-pink-500 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={item.originalName}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                      {selectedId === item.id && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedId}
              >
                <Check size={18} />
                Select Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
