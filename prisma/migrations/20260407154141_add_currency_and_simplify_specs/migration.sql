/*
  Warnings:

  - You are about to drop the column `specs` on the `cars` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ARS', 'USD');

-- AlterTable
ALTER TABLE "cars" DROP COLUMN "specs",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'ARS',
ADD COLUMN     "doors" INTEGER,
ADD COLUMN     "engine" TEXT;
