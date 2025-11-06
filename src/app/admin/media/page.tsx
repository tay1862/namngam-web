'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Download, 
  Eye, 
  X,
  Check,
  AlertCircle,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Film
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/shared/Loading';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
  folder?: string;
  alt_lo?: string;
  alt_th?: string;
  alt_zh?: string;
  alt_en?: string;
  uploadedAt: string;
}

interface MediaResponse {
  data: MediaItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function MediaLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedFolder !== 'all' && { folder: selectedFolder }),
      });

      const response = await fetch(`/api/upload?${params}`);
      const data = await response.json();

      if (data.success) {
        setMedia(data);
      } else {
        setError(data.error || 'Failed to fetch media');
      }
    } catch (err) {
      console.error('Media fetch error:', err);
      setError('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedFolder]);

  useEffect(() => {
    if (session) {
      fetchMedia();
    }
  }, [session, fetchMedia]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        setUploadProgress(((index + 1) / files.length) * 100);
        return result.data;
      });

      await Promise.all(uploadPromises);
      setShowUploadModal(false);
      fetchMedia(); // Refresh the media list
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) {
      return;
    }

    try {
      const deletePromises = ids.map(id => 
        fetch(`/api/upload/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setSelectedItems([]);
      fetchMedia(); // Refresh the media list
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete items');
    }
  };

  const handleSelectAll = () => {
    if (media?.data) {
      if (selectedItems.length === media.data.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(media.data.map(item => item.id));
      }
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFolders = ['all', 'general', 'products', 'articles', 'banners'];

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Media Library</h1>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload size={20} />
          Upload Files
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Folder Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                >
                  {filteredFolders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder === 'all' ? 'All Folders' : folder.charAt(0).toUpperCase() + folder.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleSelectAll}
                  variant="ghost"
                  size="sm"
                >
                  {selectedItems.length === (media?.data?.length || 0) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDelete(selectedItems)}
                  variant="danger"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Grid/List */}
      {media && (
        <Card>
          <CardContent className="pt-6">
            {media.data.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedFolder !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first media files to get started'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
                : 'space-y-2'
              }>
                {media.data.map((item) => {
                  const Icon = getFileIcon(item.mimeType);
                  const isSelected = selectedItems.includes(item.id);
                  
                  return viewMode === 'grid' ? (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                        isSelected ? 'border-pink-500' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectItem(item.id)}
                    >
                      {/* Checkbox */}
                      <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 ${
                        isSelected ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>

                      {/* Preview */}
                      {item.mimeType.startsWith('image/') ? (
                        <div className="w-full h-32 relative">
                          <img
                            src={item.url}
                            alt={item.alt_en || item.originalName}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              // Fallback for broken images
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.svg';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <Icon size={32} className="text-gray-400" />
                        </div>
                      )}

                      {/* Info Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 transition-all p-2 flex flex-col justify-end opacity-0 group-hover:opacity-100">
                        <p className="text-white text-sm truncate">{item.originalName}</p>
                        <p className="text-white text-xs">{formatFileSize(item.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                        isSelected ? 'border-pink-500' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectItem(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.originalName}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(item.size)} • {item.folder || 'general'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, '_blank');
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = item.url;
                            link.download = item.originalName;
                            link.click();
                          }}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {media.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * media.pagination.limit) + 1} to{' '}
                  {Math.min(currentPage * media.pagination.limit, media.pagination.total)} of{' '}
                  {media.pagination.total} items
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {currentPage} of {media.pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(media.pagination.totalPages, prev + 1))}
                    disabled={currentPage === media.pagination.totalPages}
                    variant="ghost"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
