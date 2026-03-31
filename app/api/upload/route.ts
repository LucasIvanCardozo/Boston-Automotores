import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, uploadDocument } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PDF_SIZE = 20 * 1024 * 1024 // 20MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PDF_TYPE = 'application/pdf'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Get carId from URL or body
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const carId = formData.get('carId') as string | null
    const order = parseInt((formData.get('order') as string) || '0', 10)
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    if (!carId) {
      return NextResponse.json({ error: 'Se requiere carId' }, { status: 400 })
    }

    // Check if this is a technical sheet upload (PDF)
    const isTechnicalSheet = type === 'technical-sheet'

    // Validate file type
    if (isTechnicalSheet) {
      // Technical sheets must be PDFs
      if (file.type !== PDF_TYPE) {
        return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo se permiten archivos PDF.' }, { status: 400 })
      }
      if (file.size > MAX_PDF_SIZE) {
        return NextResponse.json({ error: 'El archivo es demasiado grande. Máximo 20MB.' }, { status: 400 })
      }
    } else {
      // Regular image uploads
      if (!IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.' }, { status: 400 })
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'El archivo es demasiado grande. Máximo 10MB.' }, { status: 400 })
      }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    let result;

    if (isTechnicalSheet) {
      // Upload PDF as document (raw resource type)
      result = await uploadDocument(dataUri, {
        folder: `client-boston/documents`,
        publicId: `${carId}/technical`,
      })

      return NextResponse.json({
        publicId: result.public_id,
        url: result.secure_url,
        filename: file.name,
      })
    } else {
      // Upload image
      result = await uploadImage(dataUri, {
        folder: `client-boston/cars/${carId}`,
        publicId: String(order),
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      })

      return NextResponse.json({
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}
