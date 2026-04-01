import { getFeaturedCars } from '@/lib/data/cars';
import Hero from '@/components/sections/Hero/Hero';
import Services from '@/components/sections/Services/Services';
import FeaturedCars from '@/components/sections/FeaturedCars/FeaturedCars';
import InstagramFeed from '@/components/sections/InstagramFeed/InstagramFeed';
import LocationMap from '@/components/sections/LocationMap/LocationMap';
import ContactSection from '@/components/sections/ContactSection/ContactSection';

export default async function HomePage() {
  const featuredCars = await getFeaturedCars();

  return (
    <>
      <Hero />
      <Services />
      <FeaturedCars cars={featuredCars} />
      <InstagramFeed />
      <LocationMap />
      <ContactSection />
    </>
  );
}
