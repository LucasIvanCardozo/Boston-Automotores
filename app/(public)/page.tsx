import { getFeaturedCars } from '@/lib/data/cars'
import Hero from '@/components/sections/Hero/Hero'
import Services from '@/components/sections/Services/Services'
import FeaturedCars from '@/components/sections/FeaturedCars/FeaturedCars'
import InstagramFeed from '@/components/sections/InstagramFeed/InstagramFeed'
import LocationMap from '@/components/sections/LocationMap/LocationMap'
import ContactSection from '@/components/sections/ContactSection/ContactSection'
import SeoContent from '@/components/sections/SeoContent/SeoContent'
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bostonautomotores.com.ar'

export const metadata: Metadata = {
  title: 'Boston Automotores - Autos Usados en Mar del Plata',
  description:
    'Encontrá los mejores autos usados en Mar del Plata. Boston Automotores ofrece financiación flexible, garantía mecánica y más de 20 años de experiencia.',
  alternates: {
    canonical: `${baseUrl}/`,
  },
}

export const revalidate = 10

export default async function HomePage() {
  const featuredCars = await getFeaturedCars()

  return (
    <>
      <Hero />
      <Services />
      <FeaturedCars cars={featuredCars} />
      <InstagramFeed />
      <LocationMap />
      <ContactSection />
      <SeoContent />
    </>
  )
}
