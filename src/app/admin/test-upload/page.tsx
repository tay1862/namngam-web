'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ImageUploader from '@/components/admin/forms/ImageUploader';
import ImagePicker from '@/components/admin/forms/ImagePicker';
import Image from 'next/image';

export default function TestUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [pickedUrl, setPickedUrl] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-8">
        Image Upload Test Page
      </h1>

      <div className="space-y-8">
        {/* ImageUploader Test */}
        <Card>
          <CardHeader>
            <CardTitle>1. ImageUploader Component (Drag & Drop)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              folder="test"
              onUploadComplete={(url, id) => {
                setUploadedUrl(url);
                console.log('Uploaded:', url, id);
              }}
            />
            {uploadedUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Uploaded URL:</p>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm break-all">
                  {uploadedUrl}
                </code>
                <div className="mt-4 relative aspect-video rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={uploadedUrl}
                    alt="Uploaded"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ImagePicker Test */}
        <Card>
          <CardHeader>
            <CardTitle>2. ImagePicker Component (Select from Library)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImagePicker
              value={pickedUrl}
              onChange={setPickedUrl}
              folder="test"
              label="Select Image"
            />
            {pickedUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Selected URL:</p>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm break-all">
                  {pickedUrl}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">✨ How to Test:</h3>
            <ol className="space-y-2 text-sm">
              <li>
                <strong>1. Test ImageUploader:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                  <li>• Drag &amp; drop an image onto the upload area</li>
                  <li>• Or click to browse and select a file</li>
                  <li>• Image will auto-upload and optimize</li>
                  <li>• URL will display below</li>
                </ul>
              </li>
              <li>
                <strong>2. Test ImagePicker:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                  <li>• Click &quot;Click to select image&quot;</li>
                  <li>• Modal opens with your uploaded images</li>
                  <li>• Click &quot;Upload New&quot; to upload more</li>
                  <li>• Select an image and click &quot;Select Image&quot;</li>
                </ul>
              </li>
              <li>
                <strong>3. Check Media Library:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                  <li>• Go to <code className="bg-white px-2 py-0.5 rounded">/admin/media</code></li>
                  <li>• View all uploaded images</li>
                  <li>• Delete, copy URL, or manage images</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
