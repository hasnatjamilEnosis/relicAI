"use server";

import prisma from "@/config/db-config";
import { handleAction } from "@/utils/actionHandler";
import { revalidatePath } from "next/cache";
import { getAuthHeader } from "@/utils/authTokenGenerator";
import axios from "axios";
import { JiraApiRoutes } from "@/constants/jira/api-routes";

export const saveSettings = async (
  llamaModel: string,
  llamaApiUrl: string,
  jiraOrgUrl: string,
  jiraAuthUserEmail: string,
  jiraApiKey: string,
  preferredProjectId: string,
  preferredUsersIds: string
) => {
  return handleAction(async () => {
    if (!jiraOrgUrl || jiraOrgUrl.trim() === "") {
      throw new Error("The JIRA Organization URL is required.");
    }
    if (!jiraApiKey || jiraApiKey.trim() === "") {
      throw new Error("The JIRA API Key is required.");
    }
    if (
      !jiraOrgUrl.startsWith("https://") &&
      !jiraOrgUrl.startsWith("http://")
    ) {
      throw new Error(
        "The JIRA Organization URL must start with http:// or https://."
      );
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
            llamaApiUrl: llamaApiUrl,
            llamaModel: llamaModel,
            jiraAuthUserEmail: jiraAuthUserEmail,
            jiraOrgUrl: jiraOrgUrl,
            jiraApiKey: jiraApiKey,
            preferredProject: preferredProjectId,
            preferredUsers: preferredUsersIdsArray,
          },
        })
      : await prisma.settings.create({
          data: {
            llamaModel: llamaModel,
            llamaApiUrl: llamaApiUrl,
            jiraAuthUserEmail: jiraAuthUserEmail,
            jiraOrgUrl: jiraOrgUrl,
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

export async function getAllJiraProjects() {
  return handleAction(async () => {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      throw new Error("JIRA org name and API key not found in settings.");
    }
    if (!settings.jiraOrgUrl) {
      throw new Error("JIRA org name not found in settings.");
    }
    if (!settings.jiraApiKey) {
      throw new Error("JIRA API key is not available in settings.");
    }

    const { jiraOrgUrl, jiraApiKey, jiraAuthUserEmail } = settings;

    const response = await axios.get(
      `${jiraOrgUrl}/${JiraApiRoutes.GET_ALL_PROJECTS}`,
      {
        headers: {
          Authorization: getAuthHeader(jiraAuthUserEmail, jiraApiKey),
          "Content-Type": "application/json",
        },
      }
    );

    // Parse and return the project data
    const projects = await response.data;
    const formattedProjects = projects.map((project: any) => ({
      value: project.key,
      label: project.name,
    }));

    return formattedProjects;
  });
}

export async function getAllUsersFromJira() {
  return handleAction(async () => {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      throw new Error("JIRA org name and API key not found in settings.");
    }
    if (!settings.jiraOrgUrl) {
      throw new Error("JIRA org name not found in settings.");
    }
    if (!settings.jiraApiKey) {
      throw new Error("JIRA API key is not available in settings.");
    }

    const { jiraOrgUrl, jiraApiKey, jiraAuthUserEmail } = settings;

    // Send request to Jira API to search for users by username
    const response = await axios.get(
      `${jiraOrgUrl}/${JiraApiRoutes.GET_ALL_USERS}`,
      {
        headers: {
          Authorization: getAuthHeader(jiraAuthUserEmail, jiraApiKey),
          "Content-Type": "application/json",
        },
      }
    );

    // Parse and return the project data
    const users = await response.data;

    const formattedUsers = users
      .map((user: any) => ({
        value: user.accountId,
        label: user.displayName,
        accountType: user.accountType,
      }))
      .filter((user: any) => user.accountType !== "app");

    return formattedUsers;
  });
}
