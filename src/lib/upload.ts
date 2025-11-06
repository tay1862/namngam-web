import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  width?: number;
  height?: number;
}

export async function uploadImage(
  file: File,
  folder: string = 'general'
): Promise<UploadedFile> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name).toLowerCase();
    const filename = `${timestamp}-${randomStr}${ext}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);

    // Optimize image with Sharp
    let processedBuffer: Buffer = buffer;
    let metadata: sharp.Metadata | null = null;

    if (file.type.startsWith('image/')) {
      const image = sharp(buffer);
      metadata = await image.metadata();

      // Resize if image is too large
      const maxWidth = 2000;
      const maxHeight = 2000;

      if (metadata.width && metadata.width > maxWidth) {
        image.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      if (metadata.height && metadata.height > maxHeight) {
        image.resize(null, maxHeight, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      // Optimize based on format
      if (ext === '.jpg' || ext === '.jpeg') {
        image.jpeg({ quality: 85, progressive: true });
      } else if (ext === '.png') {
        image.png({ quality: 85, compressionLevel: 9 });
      } else if (ext === '.webp') {
        image.webp({ quality: 85 });
      }

      processedBuffer = await image.toBuffer();
      metadata = await sharp(processedBuffer).metadata();
    }

    // Write file to disk
    await writeFile(filepath, processedBuffer);

    const url = `/uploads/${folder}/${filename}`;

    return {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: processedBuffer.length,
      url,
      path: filepath,
      width: metadata?.width,
      height: metadata?.height,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  return validTypes.includes(mimeType);
}

export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}
