import { Resend } from 'resend';

// Lazy initialization - only create Resend client when needed
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bostonautomotores.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@bostonautomotores.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface LeadEmailData {
  id: string;
  type: 'sell_car' | 'contact';
  name: string;
  email: string;
  phone: string;
  carBrand?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  carMileage?: number | null;
  message?: string | null;
  sourcePage: string;
  createdAt: Date;
}

interface ContactEmailData {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  sourcePage: string;
  createdAt: Date;
}

/**
 * Send email notification when a new lead is created
 */
export async function sendLeadNotificationEmail(lead: LeadEmailData): Promise<{ success: boolean; error?: string }> {
  // Dynamically import to avoid build issues with Next.js
  const { render } = await import('@react-email/render');
  const { NewLeadEmail } = await import('./email-templates');

  try {
    const emailData = {
      leadId: lead.id,
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      carBrand: lead.carBrand || undefined,
      carModel: lead.carModel || undefined,
      carYear: lead.carYear || undefined,
      carMileage: lead.carMileage || undefined,
      message: lead.message || undefined,
      sourcePage: lead.sourcePage,
      submittedAt: lead.createdAt.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      }),
      adminUrl: `${APP_URL}/admin/consultas/${lead.id}`,
    };

    const html = await render(NewLeadEmail(emailData));

    const resend = getResend();
    if (!resend) {
      console.log('Email skipped: RESEND_API_KEY not configured');
      return { success: true }; // Silent fail - email is optional
    }

    const { error } = await resend.emails.send({
      from: `Boston Automotores <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Nueva consulta: Vende tu auto - ${lead.name}`,
      html,
      replyTo: lead.email,
      tags: [
        { name: 'type', value: lead.type },
        { name: 'source', value: 'website' },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error sending lead notification email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send email notification when a contact form is submitted
 */
export async function sendContactNotificationEmail(
  lead: ContactEmailData
): Promise<{ success: boolean; error?: string }> {
  const { render } = await import('@react-email/render');
  const { ContactFormEmail } = await import('./email-templates');

  try {
    const emailData = {
      leadId: lead.id,
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      message: lead.message || undefined,
      sourcePage: lead.sourcePage,
      submittedAt: lead.createdAt.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      }),
      adminUrl: `${APP_URL}/admin/consultas/${lead.id}`,
    };

    const html = await render(ContactFormEmail(emailData));

    const resend = getResend();
    if (!resend) {
      console.log('Email skipped: RESEND_API_KEY not configured');
      return { success: true }; // Silent fail - email is optional
    }

    const { error } = await resend.emails.send({
      from: `Boston Automotores <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Nuevo mensaje de contacto - ${lead.name}`,
      html,
      replyTo: lead.email,
      tags: [
        { name: 'type', value: 'contact' },
        { name: 'source', value: 'website' },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error sending contact notification email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { getResend, ADMIN_EMAIL, FROM_EMAIL, APP_URL };
