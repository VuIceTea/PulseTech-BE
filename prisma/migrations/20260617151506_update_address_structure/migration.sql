/*
  Warnings:

  - You are about to drop the column `detailAddress` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `detail` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceName` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wardId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wardName` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "detailAddress",
DROP COLUMN "district",
DROP COLUMN "fullName",
DROP COLUMN "phone",
DROP COLUMN "province",
DROP COLUMN "ward",
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "detail" TEXT NOT NULL DEFAULT '',
ADD COLUMN "provinceId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "provinceName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "wardId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "wardName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wards_code_key" ON "wards"("code");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
