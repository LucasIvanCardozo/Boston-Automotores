import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sampleCars = [
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    price: 18500000,
    mileage: 45000,
    fuelType: 'nafta',
    transmission: 'automatica',
    status: 'available',
    featured: true,
    description: 'Toyota Corolla en excelente estado. Único dueño, service al día. Ideal para uso familiar o urbano.',
    features: ['Aire acondicionado', 'Dirección asistida', 'Cierre centralizado', 'Alarma', 'Airbags'],
  },
  {
    brand: 'Ford',
    model: 'Focus',
    year: 2019,
    price: 15200000,
    mileage: 62000,
    fuelType: 'nafta',
    transmission: 'manual',
    status: 'available',
    featured: true,
    description: 'Ford Focus SE Plus. Muy buen estado general, motor impecable.',
    features: ['Aire acondicionado', 'Dirección hidráulica', 'Levantavidrios eléctricos', 'Alarma'],
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    price: 22800000,
    mileage: 28000,
    fuelType: 'nafta',
    transmission: 'automatica',
    status: 'available',
    featured: true,
    description: 'VW Golf Highline. Como nuevo, con todas las mejoras. No se lo pierda!',
    features: ['Aire acondicionado', 'Dirección asistida', 'GPS', 'Bluetooth', 'Sensores de estacionamiento', 'Cámara de reversa'],
  },
  {
    brand: 'Chevrolet',
    model: 'Cruze',
    year: 2018,
    price: 13800000,
    mileage: 78000,
    fuelType: 'nafta',
    transmission: 'automatica',
    status: 'available',
    featured: false,
    description: 'Chevrolet Cruze LT. Muy buen estado, ideal para primer auto.',
    features: ['Aire acondicionado', 'Dirección asistida', 'Cierre centralizado'],
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 28500000,
    mileage: 15000,
    fuelType: 'nafta',
    transmission: 'cvt',
    status: 'available',
    featured: true,
    description: 'Honda Civic EX. Increíble estado, prácticamente nuevo. La mejor relación calidad-precio.',
    features: ['Aire acondicionado', 'Dirección asistida', 'GPS', 'Bluetooth', 'Asientos de cuero', 'Sunroof', 'Sensores de estacionamiento'],
  },
  {
    brand: 'Renault',
    model: 'Sandero',
    year: 2017,
    price: 9800000,
    mileage: 95000,
    fuelType: 'nafta',
    transmission: 'manual',
    status: 'available',
    featured: false,
    description: 'Renault Sandero Expression. Económico y confiable. Perfecto para la ciudad.',
    features: ['Aire acondicionado', 'Dirección asistida'],
  },
  {
    brand: 'Peugeot',
    model: '308',
    year: 2019,
    price: 16500000,
    mileage: 55000,
    fuelType: 'diesel',
    transmission: 'manual',
    status: 'available',
    featured: false,
    description: 'Peugeot 308 HDi. Motor diesel muy económico, ideal para viajes largos.',
    features: ['Aire acondicionado', 'Dirección asistida', 'Cruise control', 'Bluetooth'],
  },
  {
    brand: 'Fiat',
    model: 'Cronos',
    year: 2021,
    price: 17500000,
    mileage: 32000,
    fuelType: 'nafta',
    transmission: 'manual',
    status: 'sold',
    featured: false,
    description: 'Fiat Cronos Drive. VENDIDO - Pregunte por similares',
    features: ['Aire acondicionado', 'Dirección asistida', 'Cierre centralizado', 'Alarma'],
  },
  {
    brand: 'Nissan',
    model: 'Versa',
    year: 2020,
    price: 14200000,
    mileage: 41000,
    fuelType: 'nafta',
    transmission: 'automatica',
    status: 'available',
    featured: false,
    description: 'Nissan Versa Advance. Espacioso y cómodo, ideal para familia.',
    features: ['Aire acondicionado', 'Dirección asistida', 'Bluetooth'],
  },
  {
    brand: 'Citroën',
    model: 'C4 Cactus',
    year: 2021,
    price: 19800000,
    mileage: 25000,
    fuelType: 'nafta',
    transmission: 'automatica',
    status: 'reserved',
    featured: true,
    description: 'Citroën C4 Cactus Shine. RESERVADO - Consulte disponibilidad',
    features: ['Aire acondicionado', 'Dirección asistida', 'GPS', 'Bluetooth', 'Cámara de reversa'],
  },
];

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Clear existing cars (optional - remove if you want to keep existing)
  console.log('🗑️  Eliminando autos existentes...');
  await prisma.car.deleteMany({});
  console.log('✅ Autos eliminados\n');

  console.log('🚗 Creando autos de ejemplo...\n');

  for (const carData of sampleCars) {
    const car = await prisma.car.create({
      data: {
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        fuelType: carData.fuelType as any,
        transmission: carData.transmission as any,
        status: carData.status as any,
        featured: carData.featured,
        description: carData.description,
        features: carData.features,
      },
    });

    console.log(`✅ ${car.brand} ${car.model} (${car.year}) - $${Number(car.price).toLocaleString('es-AR')}`);
  }

  console.log('\n✨ Seed completado exitosamente!');
  console.log(`📊 Total de autos creados: ${sampleCars.length}`);
  console.log('\n🔥 Destacados:');
  sampleCars.filter(c => c.featured).forEach(c => {
    console.log(`   ⭐ ${c.brand} ${c.model}`);
  });

  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error('❌ Error durante el seed:', error);
  process.exit(1);
});
