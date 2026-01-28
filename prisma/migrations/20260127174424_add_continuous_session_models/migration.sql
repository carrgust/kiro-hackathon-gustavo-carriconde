-- CreateTable
CREATE TABLE "ContinuousSession" (
    "id" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "cycleInterval" INTEGER NOT NULL DEFAULT 15000,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "pipelineState" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCycleAt" TIMESTAMP(3),

    CONSTRAINT "ContinuousSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "agentAction" TEXT,
    "cardType" TEXT,
    "cardId" TEXT,
    "confidence" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContinuousSession_enabled_idx" ON "ContinuousSession"("enabled");

-- CreateIndex
CREATE INDEX "ContinuousSession_updatedAt_idx" ON "ContinuousSession"("updatedAt");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_createdAt_idx" ON "SessionEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionEvent_eventType_idx" ON "SessionEvent"("eventType");

-- AddForeignKey
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ContinuousSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
