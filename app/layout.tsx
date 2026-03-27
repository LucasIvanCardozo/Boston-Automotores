import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Boston Automotores',
  description: 'Concesionaria de autos usados en Mar del Plata',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
