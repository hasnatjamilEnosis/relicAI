"use server";

import prisma from "@/config/dbConfig";
import { handleAction } from "@/utils/actionHandler";
import { revalidatePath } from "next/cache";

export const saveSettings = async (
  jiraApiKey: string,
  preferredProjectId: string,
  preferredUsersIds: string
) => {
  return handleAction(async () => {
    if (!jiraApiKey || jiraApiKey.trim() === "") {
      throw new Error("The JIRA API Key is required.");
    }

    const existingSettings = await prisma.settings.findFirst();
    const preferredUsersIdsArray =
      !preferredUsersIds || preferredUsersIds.trim() === ""
        ? []
        : preferredUsersIds.split(",").map((id) => id.trim());

    const savedSettings = existingSettings
      ? await prisma.settings.update({
          where: { id: existingSettings.id },
          data: {
            jiraApiKey: jiraApiKey,
            preferredProject: preferredProjectId,
            preferredUsers: preferredUsersIdsArray,
          },
        })
      : await prisma.settings.create({
          data: {
            jiraApiKey: jiraApiKey,
            preferredProject: preferredProjectId,
            preferredUsers: preferredUsersIdsArray,
          },
        });

    revalidatePath("/settings");

    return savedSettings;
  });
};

export const getSettings = async () => {
  return handleAction(async () => {
    return await prisma.settings.findFirst();
  });
};
