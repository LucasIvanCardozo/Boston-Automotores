import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F6BBE',
          backgroundImage: 'linear-gradient(135deg, #0F6BBE 0%, #0F3B9C 100%)',
          padding: '40px',
        }}
      >
        {/* Logo/Brand area */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          <span style={{ marginRight: '12px' }}>🏎️</span>
          <span>Boston Automotores</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
            }}
          >
            Boston Automotores
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#E4E5DD',
              marginBottom: '16px',
            }}
          >
            Concesionaria de Autos en Mar del Plata
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#E4E5DD',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Tu concesionaria de confianza. Más de 20 años vendiendo autos usados de calidad.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#E4E5DD',
            fontSize: '20px',
          }}
        >
          <span>📍 Av. Colón 4469, Mar del Plata</span>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '100%',
            transform: 'translate(30%, 30%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '100%',
            transform: 'translate(-30%, -30%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
