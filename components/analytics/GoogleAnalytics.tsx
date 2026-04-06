'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check for analytics consent (GDPR compliance)
    // This can be connected to your consent management system
    const consent = localStorage.getItem('analytics-consent');
    setHasConsent(consent === 'true');
  }, []);

  useEffect(() => {
    if (!hasConsent || !gaId) return;

    // Track page views on route change
    const url = pathname + searchParams.toString();
    
    if (typeof window.gtag === 'function') {
      window.gtag('config', gaId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, hasConsent, gaId]);

  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              // GDPR compliance - anonymize IP
              anonymize_ip: true,
              // Disable advertising features until consent
              allow_google_signs: false,
              // Enable cross-domain tracking if needed
              linker: {
                domains: ['bostonautomotores.com.ar']
              }
            });
          `,
        }}
      />
    </>
  );
}

// Type declarations for window.gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      ...args: unknown[]
    ) => void;
    dataLayer: unknown[];
  }
}
