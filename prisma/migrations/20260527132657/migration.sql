/*
  Warnings:

  - You are about to drop the column `useageLimit` on the `Coupon` table. All the data in the column will be lost.
  - Made the column `fullName` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `province` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `district` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ward` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `detailAddress` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `WishlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_productId_fkey";

-- DropIndex
DROP INDEX "CartItem_cartId_key";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "province" SET NOT NULL,
ALTER COLUMN "district" SET NOT NULL,
ALTER COLUMN "ward" SET NOT NULL,
ALTER COLUMN "detailAddress" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "useageLimit",
ADD COLUMN     "usageLimit" INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingFee" SET DEFAULT 0,
ALTER COLUMN "discountAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ALTER COLUMN "salePrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rating" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "WishlistItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productVariantId" TEXT NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
