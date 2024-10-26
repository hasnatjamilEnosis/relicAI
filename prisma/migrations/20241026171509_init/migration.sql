-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "jiraApiKey" TEXT NOT NULL,
    "preferredProject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferredUser" (
    "id" TEXT NOT NULL,
    "jiraUserId" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,

    CONSTRAINT "PreferredUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferredUser_jiraUserId_settingsId_key" ON "PreferredUser"("jiraUserId", "settingsId");

-- AddForeignKey
ALTER TABLE "PreferredUser" ADD CONSTRAINT "PreferredUser_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
