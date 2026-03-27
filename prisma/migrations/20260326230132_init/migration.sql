-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('available', 'sold', 'reserved');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('nafta', 'diesel', 'electrico', 'hibrido', 'gnc');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('manual', 'automatica', 'cvt');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('sell_car', 'contact');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'closed');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'super_admin');

-- CreateTable
CREATE TABLE "cars" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "status" "CarStatus" NOT NULL DEFAULT 'available',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "features" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "carId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_sheets" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "carBrand" TEXT,
    "carModel" TEXT,
    "carYear" INTEGER,
    "carMileage" INTEGER,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "contactedAt" TIMESTAMP(3),
    "honeypot" TEXT,
    "sourcePage" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cars_brand_idx" ON "cars"("brand");

-- CreateIndex
CREATE INDEX "cars_status_idx" ON "cars"("status");

-- CreateIndex
CREATE INDEX "cars_featured_idx" ON "cars"("featured");

-- CreateIndex
CREATE INDEX "cars_deletedAt_idx" ON "cars"("deletedAt");

-- CreateIndex
CREATE INDEX "cars_price_idx" ON "cars"("price");

-- CreateIndex
CREATE INDEX "cars_year_idx" ON "cars"("year");

-- CreateIndex
CREATE INDEX "cars_createdAt_idx" ON "cars"("createdAt");

-- CreateIndex
CREATE INDEX "images_carId_idx" ON "images"("carId");

-- CreateIndex
CREATE INDEX "images_order_idx" ON "images"("order");

-- CreateIndex
CREATE UNIQUE INDEX "technical_sheets_carId_key" ON "technical_sheets"("carId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_type_idx" ON "leads"("type");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "site_config_key_key" ON "site_config"("key");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_carId_fkey" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_sheets" ADD CONSTRAINT "technical_sheets_carId_fkey" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
