// src/lib/settingsCache.ts
import prisma from "@/config/db-config";
import { Settings } from "@prisma/client";

let cachedSettings: Settings | null = null;

export async function getSettings(): Promise<Settings | null> {
  if (!cachedSettings) {
    cachedSettings = await prisma.settings.findFirst();
  }
  return cachedSettings;
}

export async function refreshSettingsCache() {
  cachedSettings = await prisma.settings.findFirst();
}
