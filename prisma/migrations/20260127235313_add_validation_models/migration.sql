-- CreateTable
CREATE TABLE "ValidationSession" (
    "id" TEXT NOT NULL,
    "originalInput" TEXT NOT NULL,
    "canonicalDescription" TEXT,
    "overallScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ValidationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillarResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pillarKey" TEXT NOT NULL,
    "pillarName" TEXT NOT NULL,
    "pillarIcon" TEXT NOT NULL,
    "pillarWeight" DOUBLE PRECISION NOT NULL,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PillarResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcategoryResult" (
    "id" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "subcategoryKey" TEXT NOT NULL,
    "subcategoryName" TEXT NOT NULL,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubcategoryResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceResult" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceIcon" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT,
    "url" TEXT,
    "snippet" TEXT,
    "publishedDate" TEXT,
    "relevanceScore" INTEGER,
    "supports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "concerns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "impactOnScore" INTEGER,
    "confidence" INTEGER,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ValidationSession_status_idx" ON "ValidationSession"("status");

-- CreateIndex
CREATE INDEX "ValidationSession_createdAt_idx" ON "ValidationSession"("createdAt");

-- CreateIndex
CREATE INDEX "PillarResult_sessionId_idx" ON "PillarResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PillarResult_sessionId_pillarKey_key" ON "PillarResult"("sessionId", "pillarKey");

-- CreateIndex
CREATE INDEX "SubcategoryResult_pillarId_idx" ON "SubcategoryResult"("pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "SubcategoryResult_pillarId_subcategoryKey_key" ON "SubcategoryResult"("pillarId", "subcategoryKey");

-- CreateIndex
CREATE INDEX "SourceResult_subcategoryId_idx" ON "SourceResult"("subcategoryId");

-- CreateIndex
CREATE INDEX "SourceResult_status_idx" ON "SourceResult"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SourceResult_subcategoryId_sourceType_key" ON "SourceResult"("subcategoryId", "sourceType");

-- AddForeignKey
ALTER TABLE "PillarResult" ADD CONSTRAINT "PillarResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ValidationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcategoryResult" ADD CONSTRAINT "SubcategoryResult_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "PillarResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceResult" ADD CONSTRAINT "SourceResult_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "SubcategoryResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
