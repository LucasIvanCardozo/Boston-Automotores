import sharp from 'sharp';
import { Readable } from 'stream';

export interface OptimizationResult {
  buffer: Buffer;
  format: 'webp' | 'jpeg';
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export interface OptimizationOptions {
  /** Maximum width in pixels (default: 1920) */
  maxWidth?: number;
  /** JPEG/WebP quality 1-100 (default: 85) */
  quality?: number;
  /** Output format (default: 'webp') */
  format?: 'webp' | 'jpeg';
  /** Whether to strip metadata (default: true) */
  stripMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  maxWidth: 1920,
  quality: 85,
  format: 'webp',
  stripMetadata: true,
};

/**
 * Optimizes an image for web upload
 * 
 * Features:
 * - Resizes to max width while maintaining aspect ratio
 * - Converts to WebP (or JPEG if specified) with quality optimization
 * - Strips metadata to reduce file size
 * - Provides detailed compression statistics
 * 
 * @param buffer - Original image buffer
 * @param options - Optimization options
 * @returns OptimizationResult with optimized buffer and metadata
 */
export async function optimizeImage(
  buffer: Buffer,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Get original metadata
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;
    
    // Calculate target dimensions
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;
    
    // Determine if we need to resize
    const shouldResize = originalWidth > config.maxWidth;
    const targetWidth = shouldResize ? config.maxWidth : originalWidth;
    const targetHeight = shouldResize 
      ? Math.round((originalHeight * config.maxWidth) / originalWidth)
      : originalHeight;

    // Configure sharp pipeline
    let pipeline = sharp(buffer, {
      animated: metadata.pages ? true : false,
    });

    // Strip metadata to reduce size (unless it's a copyright/profile photo)
    if (config.stripMetadata) {
      pipeline = pipeline.withMetadata({});
    }

    // Resize if needed (use 'inside' to prevent upscaling)
    if (shouldResize) {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format-specific optimization
    let optimizedBuffer: Buffer;
    
    if (config.format === 'webp') {
      optimizedBuffer = await pipeline
        .webp({
          quality: config.quality,
          effort: 4, // Balance between speed and compression (0-6)
          smartSubsample: true, // Better quality for images with sharp edges
          nearLossless: config.quality >= 90, // Use near-lossless for high quality
        })
        .toBuffer();
    } else {
      optimizedBuffer = await pipeline
        .jpeg({
          quality: config.quality,
          progressive: true, // Progressive JPEG for better perceived loading
          mozjpeg: true, // Use mozjpeg encoder for better compression
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true,
        })
        .toBuffer();
    }

    const optimizedSize = optimizedBuffer.length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

    // Log optimization results (helpful for monitoring)
    console.log(
      `[Image Optimization] ${(originalSize / 1024 / 1024).toFixed(2)}MB → ` +
      `${(optimizedSize / 1024 / 1024).toFixed(2)}MB ` +
      `(${compressionRatio.toFixed(1)}% reduction) | ` +
      `${originalWidth}x${originalHeight} → ${targetWidth}x${targetHeight} | ` +
      `format: ${config.format}, quality: ${config.quality}`
    );

    return {
      buffer: optimizedBuffer,
      format: config.format,
      originalSize,
      optimizedSize,
      compressionRatio,
      width: targetWidth,
      height: targetHeight,
    };

  } catch (error) {
    console.error('[Image Optimization] Error optimizing image:', error);
    throw new Error(
      `Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Creates a thumbnail version of an image
 * Useful for admin previews and gallery thumbnails
 */
export async function createThumbnail(
  buffer: Buffer,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<Buffer> {
  const { width = 400, height = 300, quality = 80 } = options;

  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality, effort: 3 })
      .toBuffer();
  } catch (error) {
    console.error('[Image Optimization] Error creating thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}

/**
 * Validates if a file is a valid image
 */
export async function validateImage(buffer: Buffer): Promise<{
  valid: boolean;
  format?: string;
  width?: number;
  height?: number;
  error?: string;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.format) {
      return { valid: false, error: 'Invalid image format' };
    }

    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif'];
    
    if (!supportedFormats.includes(metadata.format)) {
      return { 
        valid: false, 
        error: `Unsupported format: ${metadata.format}. Supported: ${supportedFormats.join(', ')}` 
      };
    }

    return {
      valid: true,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Invalid image file' 
    };
  }
}

/**
 * Converts a buffer to a Cloudinary-compatible stream
 * Cloudinary's upload_stream accepts streams, which is more memory-efficient
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Determines if an image should be optimized based on size and format
 * Skip optimization for already-optimized images
 */
export function shouldOptimize(
  fileSize: number,
  mimeType: string,
  options: { skipIfUnderKB?: number } = {}
): boolean {
  const { skipIfUnderKB = 100 } = options;
  
  // Skip if already WebP and under threshold
  if (mimeType === 'image/webp' && fileSize < skipIfUnderKB * 1024) {
    return false;
  }
  
  return true;
}
