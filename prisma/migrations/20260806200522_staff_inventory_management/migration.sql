-- AlterTable
ALTER TABLE "products" ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "supplier" TEXT;

-- AlterTable
ALTER TABLE "stylists" ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "stylist_schedules" (
    "id" TEXT NOT NULL,
    "stylistId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stylist_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stylist_leave" (
    "id" TEXT NOT NULL,
    "stylistId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stylist_leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_periods" (
    "id" TEXT NOT NULL,
    "stylistId" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stylist_schedules_stylistId_day_key" ON "stylist_schedules"("stylistId", "day");

-- CreateIndex
CREATE INDEX "stylist_leave_stylistId_start_idx" ON "stylist_leave"("stylistId", "start");

-- CreateIndex
CREATE INDEX "blocked_periods_stylistId_start_idx" ON "blocked_periods"("stylistId", "start");

-- AddForeignKey
ALTER TABLE "stylist_schedules" ADD CONSTRAINT "stylist_schedules_stylistId_fkey" FOREIGN KEY ("stylistId") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stylist_leave" ADD CONSTRAINT "stylist_leave_stylistId_fkey" FOREIGN KEY ("stylistId") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_periods" ADD CONSTRAINT "blocked_periods_stylistId_fkey" FOREIGN KEY ("stylistId") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
