-- AlterTable: Add missing fields to users table
ALTER TABLE "users" ADD COLUMN "password" TEXT, ADD COLUMN "role" TEXT DEFAULT 'CLIENT', ADD COLUMN "walletBalance" DECIMAL(12,2) DEFAULT 0, ADD COLUMN "totalSpent" DECIMAL(12,2) DEFAULT 0, ADD COLUMN "totalEarned" DECIMAL(12,2) DEFAULT 0, ADD COLUMN "hasPaid" BOOLEAN DEFAULT false;
