import { NextRequest, NextResponse } from 'next/server'
import { uploadImageBuffer, uploadDocument, deleteAsset } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/auth'
import { 
  optimizeImage, 
  validateImage, 
  shouldOptimize,
  type OptimizationResult 
} from '@/lib/image-optimization'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PDF_SIZE = 20 * 1024 * 1024 // 20MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PDF_TYPE = 'application/pdf'

interface UploadSuccessResponse {
  success: true
  publicId: string
  url: string
  width?: number
  height?: number
  format?: string
  originalSize?: number
  optimizedSize?: number
  compressionRatio?: number
  filename?: string
}

interface UploadErrorResponse {
  success: false
  error: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadSuccessResponse | UploadErrorResponse>> {
  // Authentication check
  try {
    await requireAuth()
  } catch {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }

  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const carId = formData.get('carId') as string | null
    const type = formData.get('type') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!carId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere carId' },
        { status: 400 }
      )
    }

    // Check if this is a technical sheet upload (PDF)
    const isTechnicalSheet = type === 'technical-sheet'

    // Validate file type and size
    if (isTechnicalSheet) {
      // Technical sheets must be PDFs
      if (file.type !== PDF_TYPE) {
        return NextResponse.json(
          { success: false, error: 'Tipo de archivo no permitido. Solo se permiten archivos PDF.' },
          { status: 400 }
        )
      }
      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json(
          { success: false, error: 'El archivo es demasiado grande. Máximo 20MB.' },
          { status: 400 }
        )
      }
    } else {
      // Regular image uploads
      if (!IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.' },
          { status: 400 }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'El archivo es demasiado grande. Máximo 10MB.' },
          { status: 400 }
        )
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes) as Buffer

    let result: UploadSuccessResponse

    if (isTechnicalSheet) {
      // Upload PDF as document (no optimization needed for PDFs)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      
      const uploadResult = await uploadDocument(dataUri, {
        folder: `client-boston/documents`,
        publicId: `${carId}/technical`,
      })

      result = {
        success: true,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        filename: file.name,
      }
    } else {
      // Image upload with optimization
      let optimizedResult: OptimizationResult | null = null
      let uploadBuffer = buffer
      let uploadFormat: string | undefined

      // Check if we should optimize this image
      if (shouldOptimize(file.size, file.type, { skipIfUnderKB: 200 })) {
        try {
          // Validate image before optimization
          const validation = await validateImage(buffer)
          if (!validation.valid) {
            return NextResponse.json(
              { success: false, error: validation.error || 'Imagen inválida' },
              { status: 400 }
            )
          }

          // Optimize the image
          optimizedResult = await optimizeImage(buffer, {
            maxWidth: 1920,
            quality: 85,
            format: 'webp',
            stripMetadata: true,
          })

          uploadBuffer = optimizedResult.buffer
          uploadFormat = optimizedResult.format
        } catch (optimizeError) {
          // Log optimization error but continue with original file
          console.warn(
            '[Upload] Image optimization failed, uploading original:',
            optimizeError instanceof Error ? optimizeError.message : 'Unknown error'
          )
          // Fall back to original buffer
          uploadBuffer = buffer
          uploadFormat = undefined
        }
      } else {
        console.log('[Upload] Skipping optimization - image is already optimized or small')
      }

      // Use a crypto-random UUID as public_id — never the order value.
      // This prevents Cloudinary overwrites when images are reordered
      // after upload but before saving to the database.
      const uniqueId = crypto.randomUUID()

      // Upload optimized (or original) buffer to Cloudinary
      const uploadResult = await uploadImageBuffer(uploadBuffer, {
        folder: `client-boston/cars/${carId}`,
        publicId: uniqueId,
        format: uploadFormat,
      })

      result = {
        success: true,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        ...(optimizedResult && {
          originalSize: optimizedResult.originalSize,
          optimizedSize: optimizedResult.optimizedSize,
          compressionRatio: parseFloat(optimizedResult.compressionRatio.toFixed(1)),
        }),
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload
 * Deletes a staged (not yet saved to DB) Cloudinary asset.
 * Called when the user removes an image from the uploader before saving the form.
 * Body: { publicId: string }
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json() as { publicId?: unknown }
    const publicId = body.publicId

    if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Se requiere publicId' },
        { status: 400 }
      )
    }

    await deleteAsset(publicId.trim())

    console.log(`[Upload] Staged asset deleted from Cloudinary: ${publicId}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Upload] Error deleting staged asset:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar el archivo',
      },
      { status: 500 }
    )
  }
}
