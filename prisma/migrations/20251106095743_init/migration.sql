-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN', 'VA_MANAGER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ANALYZING', 'READY', 'APPROVED', 'IN_SOURCING', 'INTERVIEWS', 'HIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HiringStage" AS ENUM ('INTAKE', 'JD_APPROVED', 'SOURCING', 'SHORTLIST', 'INTERVIEWS', 'TEST_TASK', 'OFFER', 'HIRED');

-- CreateEnum
CREATE TYPE "BusinessGoal" AS ENUM ('MORE_LEADS', 'MORE_BOOKED_CALLS', 'MORE_CLOSED_DEALS', 'FASTER_DELIVERY', 'BETTER_RETENTION', 'FOUNDER_TIME_BACK', 'SCALE_OPERATIONS', 'COST_REDUCTION');

-- CreateEnum
CREATE TYPE "EnglishLevel" AS ENUM ('BASIC', 'GOOD', 'EXCELLENT', 'NEAR_NATIVE');

-- CreateEnum
CREATE TYPE "BudgetBand" AS ENUM ('LITE', 'STANDARD', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ManagementStyle" AS ENUM ('HANDS_ON', 'ASYNC', 'DAILY_STANDUP', 'WEEKLY', 'BIWEEKLY');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SOLO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "ContractDuration" AS ENUM ('ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'ONGOING');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DEDICATED_VA', 'UNICORN_VA', 'POD', 'HYBRID');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REGENERATING');

-- CreateEnum
CREATE TYPE "CraftFamily" AS ENUM ('BUSINESS_OPS', 'GROWTH_REVENUE', 'TECH_AUTOMATION', 'CREATIVE_BUILD');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_SOURCING', 'CANDIDATES_REVIEWING', 'HIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('SOP', 'EXAMPLE', 'REFERENCE', 'BRAND_ASSET', 'KPI_SNAPSHOT', 'JOB_DESCRIPTION');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('PROJECT_CREATED', 'INPUT_SAVED', 'ANALYSIS_STARTED', 'ANALYSIS_COMPLETED', 'ANALYSIS_FAILED', 'JD_APPROVED', 'JD_REGENERATED', 'FILE_UPLOADED', 'FILE_DELETED', 'VERSION_CREATED', 'STATUS_CHANGED', 'ROLE_SPLIT_APPLIED', 'EXPORTED_PDF', 'EXPORTED_JSON', 'SHARED');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('INDUSTRY', 'ROLE_TYPE', 'SKILL', 'TOOL', 'SERVICE', 'PRIORITY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "timezone" TEXT DEFAULT 'America/New_York',
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "hiringStage" "HiringStage" DEFAULT 'INTAKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInput" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "companySize" "CompanySize",
    "primaryBusinessGoal" "BusinessGoal" NOT NULL,
    "topTasks" TEXT[],
    "outcome90Days" TEXT NOT NULL,
    "weeklyHoursNeeded" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "requiredDailyOverlap" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "contractDuration" "ContractDuration",
    "clientFacing" BOOLEAN NOT NULL,
    "toolsInUse" TEXT[],
    "englishLevel" "EnglishLevel" NOT NULL,
    "budgetBand" "BudgetBand" NOT NULL,
    "mustHaveRequirements" TEXT[],
    "niceToHaveSkills" TEXT,
    "existingSOPs" BOOLEAN NOT NULL DEFAULT false,
    "reportingExpectations" TEXT,
    "managementStyle" "ManagementStyle",
    "securityNeeds" TEXT,
    "dealBreakers" TEXT[],
    "roleSplitPreference" BOOLEAN NOT NULL DEFAULT true,
    "allowRemote" BOOLEAN NOT NULL DEFAULT true,
    "exampleLinks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIOutput" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "whatYouToldUs" TEXT,
    "detectedCrafts" JSONB,
    "splitLogic" JSONB,
    "roleSummary" JSONB,
    "roleSplitTable" JSONB,
    "primaryJobDesc" TEXT,
    "secondaryJobDescs" JSONB,
    "serviceRecommendation" JSONB,
    "serviceMapping" "ServiceType",
    "onboardingChecklist" JSONB,
    "scorecard" JSONB,
    "riskTradeoffs" JSONB,
    "renderedMarkdown" TEXT,
    "renderedHTML" TEXT,
    "pdfUrl" TEXT,
    "jsonExport" JSONB,
    "optionalArtifacts" JSONB,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "processingTime" INTEGER,
    "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "family" "CraftFamily" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "purpose" TEXT NOT NULL,
    "coreOutcomes" TEXT[],
    "weeklyHours" INTEGER NOT NULL,
    "clientFacing" BOOLEAN NOT NULL,
    "skills" TEXT[],
    "tools" TEXT[],
    "personality" TEXT[],
    "kpis" JSONB NOT NULL,
    "sampleWeek" JSONB NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "reportingTo" TEXT,
    "status" "RoleStatus" NOT NULL DEFAULT 'PENDING',
    "hiredVAId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "category" "FileCategory",
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "extractedText" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionNum" INTEGER NOT NULL,
    "label" TEXT,
    "inputState" JSONB NOT NULL,
    "outputState" JSONB NOT NULL,
    "changedBy" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "actorName" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "category" "TagCategory",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_hiringStage_idx" ON "Project"("hiringStage");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientInput_projectId_key" ON "ClientInput"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AIOutput_projectId_key" ON "AIOutput"("projectId");

-- CreateIndex
CREATE INDEX "AIOutput_generationStatus_idx" ON "AIOutput"("generationStatus");

-- CreateIndex
CREATE INDEX "Role_projectId_idx" ON "Role"("projectId");

-- CreateIndex
CREATE INDEX "Role_family_idx" ON "Role"("family");

-- CreateIndex
CREATE INDEX "Role_status_idx" ON "Role"("status");

-- CreateIndex
CREATE INDEX "UploadedFile_projectId_idx" ON "UploadedFile"("projectId");

-- CreateIndex
CREATE INDEX "UploadedFile_type_idx" ON "UploadedFile"("type");

-- CreateIndex
CREATE INDEX "Version_projectId_idx" ON "Version"("projectId");

-- CreateIndex
CREATE INDEX "Version_createdAt_idx" ON "Version"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Version_projectId_versionNum_key" ON "Version"("projectId", "versionNum");

-- CreateIndex
CREATE INDEX "Activity_projectId_idx" ON "Activity"("projectId");

-- CreateIndex
CREATE INDEX "Activity_action_idx" ON "Activity"("action");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInput" ADD CONSTRAINT "ClientInput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
