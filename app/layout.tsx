import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Boston Automotores | Concesionaria de Autos en Mar del Plata',
    template: '%s | Boston Automotores',
  },
  description:
    'Tu concesionaria de confianza en Mar del Plata. Más de 20 años vendiendo autos usados de calidad. Visítanos en Av. Colón 4469.',
  keywords: [
    'concesionaria',
    'autos usados',
    'Mar del Plata',
    'vehículos',
    'Boston Automotores',
    'auto usado',
    'comprar auto',
  ],
  authors: [{ name: 'Boston Automotores' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Boston Automotores',
    title: 'Boston Automotores | Concesionaria de Autos en Mar del Plata',
    description:
      'Tu concesionaria de confianza en Mar del Plata. Más de 20 años vendiendo autos usados de calidad.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Boston Automotores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boston Automotores',
    description: 'Tu concesionaria de confianza en Mar del Plata.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="es">
      <head>
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* LocalBusiness Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoDealer',
              name: 'Boston Automotores',
              description: 'Concesionaria de autos usados en Mar del Plata',
              url: 'https://bostonautomotores.com.ar',
              telephone: '+5492236329761',
              email: 'bostonautomotores@hotmail.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Av. Colón 4469',
                addressLocality: 'Mar del Plata',
                addressRegion: 'Buenos Aires',
                addressCountry: 'AR',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -38.0055,
                longitude: -57.5426,
              },
              openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-13:00'],
              sameAs: [
                'https://www.instagram.com/boston_automotores/',
                'https://www.facebook.com/www.bostonautomotores.com.ar/',
              ],
              image: '/assets/logo-sin-fondo.png',
              priceRange: '$$',
            }),
          }}
        />
      </head>
      <body>
        {children}
        
        {/* Google Analytics - only loads in production */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
