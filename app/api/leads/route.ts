import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactFormSchema, sellCarFormSchema } from '@/lib/schemas/contact';
import { sendLeadNotificationEmail, sendContactNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, message, carBrand, carModel, carYear, carMileage, sourcePage, honeypot } = body;

    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      // Silently accept but don't process (fool bots)
      return NextResponse.json({ success: true });
    }

    // Validate based on type
    const validationSchema = type === 'sell_car' ? sellCarFormSchema : contactFormSchema;
    const validation = validationSchema.safeParse({
      name,
      email,
      phone,
      message,
      carBrand,
      carModel,
      carYear: carYear ? parseInt(carYear, 10) : undefined,
      carMileage: carMileage ? parseInt(carMileage, 10) : undefined,
      sourcePage: sourcePage || (type === 'sell_car' ? '/vende-tu-auto' : '/contacto'),
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message;
      return NextResponse.json(
        { success: false, error: firstError || 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        type: type === 'sell_car' ? 'sell_car' : 'contact',
        name,
        email,
        phone,
        message: message || null,
        carBrand: carBrand || null,
        carModel: carModel || null,
        carYear: carYear ? parseInt(carYear, 10) : null,
        carMileage: carMileage ? parseInt(carMileage, 10) : null,
        sourcePage: sourcePage || '/',
        ipAddress,
      },
    });

    // Send email notification (non-blocking - don't fail the request if email fails)
    const emailPayload = {
      id: lead.id,
      type: lead.type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      carBrand: lead.carBrand,
      carModel: lead.carModel,
      carYear: lead.carYear,
      carMileage: lead.carMileage,
      message: lead.message,
      sourcePage: lead.sourcePage,
      createdAt: lead.createdAt,
    };

    if (lead.type === 'sell_car') {
      sendLeadNotificationEmail(emailPayload).catch((err) => {
        console.error('Failed to send lead notification email:', err);
      });
    } else {
      sendContactNotificationEmail({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        sourcePage: lead.sourcePage,
        createdAt: lead.createdAt,
      }).catch((err) => {
        console.error('Failed to send contact notification email:', err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la consulta' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
