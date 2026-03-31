import { Suspense } from 'react';
import { getFeaturedCars } from '@/lib/data/cars';
import Hero from '@/components/sections/Hero/Hero';
import Services from '@/components/sections/Services/Services';
import FeaturedCars from '@/components/sections/FeaturedCars/FeaturedCars';
import InstagramFeed from '@/components/sections/InstagramFeed/InstagramFeed';
import LocationMap from '@/components/sections/LocationMap/LocationMap';
export default async function HomePage() {
  const featuredCars = await getFeaturedCars();

  return (
    <>
      <Hero />
      <Services />
      <FeaturedCars cars={featuredCars} />
      <InstagramFeed />
      <LocationMap />
    </>
  );
}
