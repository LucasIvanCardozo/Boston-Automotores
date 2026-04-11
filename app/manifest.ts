import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Boston Automotores',
    short_name: 'Boston Auto',
    description: 'Concesionaria de autos usados en Mar del Plata',
    start_url: '/',
    display: 'standalone',
    background_color: '#171717',
    theme_color: '#171717',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '256x256',
        type: 'image/x-icon',
      },
    ],
  }
}
