import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import Hero from '@/components/sections/Hero/Hero';
import Services from '@/components/sections/Services/Services';
import FeaturedCars from '@/components/sections/FeaturedCars/FeaturedCars';
import InstagramFeed from '@/components/sections/InstagramFeed/InstagramFeed';
import LocationMap from '@/components/sections/LocationMap/LocationMap';
import Loading from '@/components/ui/Loading/Loading';

async function getFeaturedCars() {
  try {
    const cars = await prisma.car.findMany({
      where: {
        featured: true,
        deletedAt: null,
        status: 'available',
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    return cars.map((car) => ({
      ...car,
      price: Number(car.price),
    }));
  } catch (error) {
    console.error('Error fetching featured cars:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredCars = await getFeaturedCars();

  return (
    <>
      <Hero />
      <Services />
      <Suspense fallback={<Loading />}>
        <FeaturedCars cars={featuredCars} />
      </Suspense>
      <InstagramFeed />
      <LocationMap />
    </>
  );
}
