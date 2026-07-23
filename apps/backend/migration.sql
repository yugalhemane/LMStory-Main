-- CreateEnum
CREATE TYPE "DeploymentMode" AS ENUM ('SAAS', 'ON_PREM', 'HYBRID');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('WEB', 'ANDROID', 'IOS', 'DESKTOP', 'API');

-- CreateEnum
CREATE TYPE "BrowserType" AS ENUM ('CHROME', 'EDGE', 'FIREFOX', 'SAFARI', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('EMAIL_OTP', 'EMAIL_LINK', 'SMS_OTP', 'AUTHENTICATOR');

-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_MFA', 'CHANGE_EMAIL', 'INVITATION_ACCEPT');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('ADMIN_INVITE', 'TRAINER_INVITE', 'LEARNER_INVITE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TenantStatus" ADD VALUE 'PENDING_VERIFICATION';
ALTER TYPE "TenantStatus" ADD VALUE 'VERIFIED';
ALTER TYPE "TenantStatus" ADD VALUE 'ONBOARDING';
ALTER TYPE "TenantStatus" ADD VALUE 'ACTIVE_TRIAL';
ALTER TYPE "TenantStatus" ADD VALUE 'ACTIVE_PAID';
ALTER TYPE "TenantStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "browser" "BrowserType",
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "platform" "PlatformType",
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "deploymentMode" "DeploymentMode" NOT NULL DEFAULT 'SAAS';

-- AlterTable
ALTER TABLE "_LibraryContentToLibrarySkill" DROP CONSTRAINT "_LibraryContentToLibrarySkill_AB_pkey";

-- AlterTable
ALTER TABLE "_LibraryContentToLibraryTag" DROP CONSTRAINT "_LibraryContentToLibraryTag_AB_pkey";

-- CreateTable
CREATE TABLE "VerificationChallenge" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" "VerificationMethod" NOT NULL,
    "purpose" "VerificationPurpose" NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedName" TEXT,
    "role" "Role" NOT NULL,
    "type" "InvitationType" NOT NULL DEFAULT 'LEARNER_INVITE',
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "licenseKey" TEXT,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING',
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "activatedBy" TEXT,
    "lastValidatedAt" TIMESTAMP(3),
    "validationSource" TEXT,
    "maxUsers" INTEGER,
    "maxStorage" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "machineFingerprint" TEXT,
    "version" TEXT,
    "deploymentMode" "DeploymentMode" NOT NULL DEFAULT 'ON_PREM',
    "activatedAt" TIMESTAMP(3),
    "lastHealthCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "provider" TEXT,
    "providerCustomerId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "SubscriptionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationChallenge_tokenHash_key" ON "VerificationChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "VerificationChallenge_userId_idx" ON "VerificationChallenge"("userId");

-- CreateIndex
CREATE INDEX "VerificationChallenge_tokenHash_idx" ON "VerificationChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "VerificationChallenge_status_idx" ON "VerificationChallenge"("status");

-- CreateIndex
CREATE INDEX "VerificationChallenge_expiresAt_idx" ON "VerificationChallenge"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_tokenHash_idx" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- CreateIndex
CREATE INDEX "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tenantId_email_key" ON "Invitation"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "License_tenantId_key" ON "License"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseKey_key" ON "License"("licenseKey");

-- CreateIndex
CREATE INDEX "License_status_idx" ON "License"("status");

-- CreateIndex
CREATE INDEX "License_expiresAt_idx" ON "License"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_licenseId_key" ON "Installation"("licenseId");

-- CreateIndex
CREATE INDEX "Installation_deploymentMode_idx" ON "Installation"("deploymentMode");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionAccount_tenantId_key" ON "SubscriptionAccount"("tenantId");

-- CreateIndex
CREATE INDEX "SubscriptionAccount_status_idx" ON "SubscriptionAccount"("status");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "_LibraryContentToLibrarySkill_AB_unique" ON "_LibraryContentToLibrarySkill"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_LibraryContentToLibraryTag_AB_unique" ON "_LibraryContentToLibraryTag"("A", "B");

-- AddForeignKey
ALTER TABLE "VerificationChallenge" ADD CONSTRAINT "VerificationChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAccount" ADD CONSTRAINT "SubscriptionAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAccount" ADD CONSTRAINT "SubscriptionAccount_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

