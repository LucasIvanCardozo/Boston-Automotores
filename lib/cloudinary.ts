import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Define response types
export interface UploadApiResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
  [key: string]: unknown;
}

interface DeleteApiResponse {
  result: string;
  [key: string]: unknown;
}

interface ResourceApiResponse {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  [key: string]: unknown;
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Folder constants
export const CLOUDINARY_FOLDER = 'client-boston';
export const CARS_FOLDER = `${CLOUDINARY_FOLDER}/cars`;
export const DOCUMENTS_FOLDER = `${CLOUDINARY_FOLDER}/documents`;

// Upload presets (for signed uploads)
export const UPLOAD_PRESETS = {
  carImages: {
    folder: `${CARS_FOLDER}`,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
  documents: {
    folder: `${DOCUMENTS_FOLDER}`,
    allowedFormats: ['pdf'],
    maxFileSize: 20 * 1024 * 1024, // 20MB
  },
} as const;

/**
 * Generate a public_id for car images
 */
export function generateCarImagePublicId(carId: string, order: number): string {
  return `${CARS_FOLDER}/${carId}/${order}`;
}

/**
 * Generate a public_id for technical sheets
 */
export function generateTechnicalSheetPublicId(carId: string): string {
  return `${DOCUMENTS_FOLDER}/${carId}/technical`;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: string,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: object[];
  } = {}
): Promise<UploadApiResponse> {
  const { folder = CLOUDINARY_FOLDER, publicId, transformation = [] } = options;

  return cloudinary.uploader.upload(file, {
    folder,
    public_id: publicId,
    transformation,
    resource_type: 'image',
    overwrite: true,
  }) as Promise<UploadApiResponse>;
}

/**
 * Upload an image buffer to Cloudinary using streaming
 * More memory-efficient than base64 for large files
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    format?: string;
  } = {}
): Promise<UploadApiResponse> {
  const { folder = CLOUDINARY_FOLDER, publicId, format } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        ...(format && { format }),
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as UploadApiResponse);
        } else {
          reject(new Error('Upload failed: no result returned'));
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Upload a document (PDF) to Cloudinary
 */
export async function uploadDocument(
  file: string,
  options: {
    folder?: string;
    publicId?: string;
  } = {}
): Promise<UploadApiResponse> {
  const { folder = DOCUMENTS_FOLDER, publicId } = options;

  return cloudinary.uploader.upload(file, {
    folder,
    public_id: publicId,
    resource_type: 'raw',
    overwrite: true,
  }) as Promise<UploadApiResponse>;
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteAsset(publicId: string): Promise<DeleteApiResponse> {
  return cloudinary.uploader.destroy(publicId) as Promise<DeleteApiResponse>;
}

/**
 * Delete multiple assets from Cloudinary
 */
export async function deleteAssets(publicIds: string[]): Promise<DeleteApiResponse> {
  return cloudinary.api.delete_resources(publicIds) as Promise<DeleteApiResponse>;
}

/**
 * Get resource details from Cloudinary
 */
export async function getResource(publicId: string): Promise<ResourceApiResponse> {
  return cloudinary.api.resource(publicId, {
    colors: true,
  }) as Promise<ResourceApiResponse>;
}

/**
 * Generate a signed upload URL for direct client-side uploads
 */
export function generateSignedUploadParams(options: {
  folder: string;
  publicId?: string;
  transformation?: string;
  timestamp?: number;
}): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId?: string;
  transformation?: string;
} {
  const timestamp = options.timestamp || Math.round(Date.now() / 1000);
  
  const params: Record<string, string | number> = {
    timestamp,
    folder: options.folder,
    ...(options.publicId && { public_id: options.publicId }),
    ...(options.transformation && { transformation: options.transformation }),
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET || '');

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    folder: options.folder,
    ...(options.publicId && { publicId: options.publicId }),
    ...(options.transformation && { transformation: options.transformation }),
  };
}

/**
 * Extract public_id from a Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.|\?|$)/);
  return match ? match[1] : null;
}

/**
 * Generate a thumbnail URL for an image
 */
export function generateThumbnailUrl(
  url: string,
  options: { width?: number; height?: number } = {}
): string {
  const { width = 400, height = 300 } = options;
  
  // Add transformation to the URL
  return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
}

/**
 * Verify webhook signature from Cloudinary
 */
export function verifyWebhookSignature(
  body: string,
  timestamp: number,
  signature: string
): boolean {
  const expectedSignature = cloudinary.utils.api_sign_request(
    { timestamp, body },
    process.env.CLOUDINARY_API_SECRET || ''
  );
  return expectedSignature === signature;
}

export default cloudinary;
