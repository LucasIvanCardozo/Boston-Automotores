import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewLeadEmailProps {
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  carMileage?: number;
  message?: string;
  sourcePage: string;
  submittedAt: string;
  adminUrl: string;
}

interface ContactFormEmailProps {
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
  sourcePage: string;
  submittedAt: string;
  adminUrl: string;
}

const baseStyles = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const containerStyles = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '40px',
  maxWidth: '600px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

const headingStyles = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 600 as const,
  margin: '0 0 20px 0',
};

const textStyles = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
};

const labelStyles = {
  color: '#666666',
  fontSize: '14px',
  fontWeight: 500 as const,
  marginBottom: '4px',
};

const valueStyles = {
  color: '#1a1a1a',
  fontSize: '16px',
  marginBottom: '16px',
};

const buttonStyles = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600 as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px',
} as const;

const buttonSecondaryStyles = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  color: '#374151',
  fontSize: '16px',
  fontWeight: 600 as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
} as const;

const footerStyles = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '32px',
};

export function NewLeadEmail({
  leadId,
  customerName,
  customerEmail,
  customerPhone,
  carBrand,
  carModel,
  carYear,
  carMileage,
  message,
  sourcePage,
  submittedAt,
  adminUrl,
}: NewLeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview> Nueva consulta: Vende tu auto - {customerName}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Heading style={headingStyles}>🚗 Nueva consulta: Vende tu auto</Heading>

          <Text style={{ ...textStyles, color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            Se ha recibido una nueva consulta desde Boston Automotores.
          </Text>

          <Section>
            <Text style={labelStyles}>Cliente</Text>
            <Text style={valueStyles}>
              <strong>{customerName}</strong>
            </Text>

            <Text style={labelStyles}>Email</Text>
            <Text style={valueStyles}>
              <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
            </Text>

            <Text style={labelStyles}>Teléfono</Text>
            <Text style={valueStyles}>
              <Link href={`tel:${customerPhone}`}>{customerPhone}</Link>
            </Text>

            <Hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

            <Text style={{ ...labelStyles, fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
              Datos del vehículo
            </Text>

            <Text style={labelStyles}>Marca</Text>
            <Text style={valueStyles}>{carBrand || 'No especificada'}</Text>

            <Text style={labelStyles}>Modelo</Text>
            <Text style={valueStyles}>{carModel || 'No especificado'}</Text>

            <Text style={labelStyles}>Año</Text>
            <Text style={valueStyles}>{carYear || 'No especificado'}</Text>

            <Text style={labelStyles}>Kilometraje</Text>
            <Text style={valueStyles}>
              {carMileage ? `${carMileage.toLocaleString('es-AR')} km` : 'No especificado'}
            </Text>

            {message && (
              <>
                <Hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
                <Text style={labelStyles}>Mensaje del cliente</Text>
                <Text style={{ ...valueStyles, backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px' }}>
                  {message}
                </Text>
              </>
            )}

            <Hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

            <Text style={{ ...labelStyles, fontSize: '12px', color: '#888' }}>
              Enviado el {submittedAt} desde {sourcePage}
            </Text>
            <Text style={{ ...labelStyles, fontSize: '12px', color: '#888' }}>
              ID de consulta: {leadId}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Button style={buttonStyles} href={`mailto:${customerEmail}`}>
              Responder al cliente
            </Button>
            <Button style={buttonSecondaryStyles} href={adminUrl}>
              Ver en admin
            </Button>
          </Section>

          <Text style={footerStyles}>
            Boston Automotores - Concesionaria de vehículos en Buenos Aires
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function ContactFormEmail({
  leadId,
  customerName,
  customerEmail,
  customerPhone,
  message,
  sourcePage,
  submittedAt,
  adminUrl,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo mensaje de contacto - {customerName}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Heading style={headingStyles}>📧 Nuevo mensaje de contacto</Heading>

          <Text style={{ ...textStyles, color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            Se ha recibido un nuevo mensaje de contacto desde Boston Automotores.
          </Text>

          <Section>
            <Text style={labelStyles}>Nombre</Text>
            <Text style={valueStyles}>
              <strong>{customerName}</strong>
            </Text>

            <Text style={labelStyles}>Email</Text>
            <Text style={valueStyles}>
              <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
            </Text>

            <Text style={labelStyles}>Teléfono</Text>
            <Text style={valueStyles}>
              <Link href={`tel:${customerPhone}`}>{customerPhone}</Link>
            </Text>

            {message && (
              <>
                <Hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
                <Text style={labelStyles}>Mensaje</Text>
                <Text style={{ ...valueStyles, backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                  {message}
                </Text>
              </>
            )}

            <Hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

            <Text style={{ ...labelStyles, fontSize: '12px', color: '#888' }}>
              Enviado el {submittedAt} desde {sourcePage}
            </Text>
            <Text style={{ ...labelStyles, fontSize: '12px', color: '#888' }}>
              ID de consulta: {leadId}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Button style={buttonStyles} href={`mailto:${customerEmail}`}>
              Responder al cliente
            </Button>
            <Button style={buttonSecondaryStyles} href={adminUrl}>
              Ver en admin
            </Button>
          </Section>

          <Text style={footerStyles}>
            Boston Automotores - Concesionaria de vehículos en Buenos Aires
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
