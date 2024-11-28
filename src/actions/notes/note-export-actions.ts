"use server";

import axios from "axios";
import {
  getSettingsProperty,
  getAuthHeader,
} from "@/actions/notes/note-generation-actions";

interface ConfluencePageResponse {
  id: string;
  type: string;
  title: string;
  space: {
    key: string;
    name?: string;
  };
}

/**
 * A function to check and create a Confluence space with the given key and name
 * @param spaceKey - The key of the space to check or create
 * @param spaceName - The name of the space to check or create
 * @param confluenceUrl - The URL to the Confluence API endpoint
 * @param authHeader - The authorization header for the Confluence API
 * @returns a boolean indicating whether the space exists or was successfully created
 */
async function createConfluenceSpace(
  spaceKey: string,
  spaceName: string,
  confluenceUrl: string,
  authHeader: string
): Promise<boolean> {
  console.info(
    "Starting Confluence space check or creation:",
    `SpaceKey=${spaceKey}, SpaceName=${spaceName}`
  );

  const headers = {
    Authorization: authHeader,
    "Content-Type": "application/json",
  };

  const spaceCheckUrl = `${confluenceUrl}/wiki/rest/api/space/${spaceKey}`;
  const spaceExistsResponse = await axios
    .get(spaceCheckUrl, { headers })
    .catch((error) => error.response);

  if (spaceExistsResponse && spaceExistsResponse.status === 200) {
    console.info(
      "Confluence space already exists:",
      `SpaceKey=${spaceKey}, SpaceName=${spaceName}`
    );
    return true;
  }

  if (!spaceExistsResponse || spaceExistsResponse.status !== 404) {
    console.error(
      "Error checking Confluence space existence:",
      spaceExistsResponse?.status || "Unknown error"
    );
    return false;
  }

  const data = {
    key: spaceKey,
    name: spaceName,
    description: {
      plain: {
        value: "This is a summary space created for Relic AI.",
        representation: "plain",
      },
    },
  };

  const createSpaceResponse = await axios
    .post(`${confluenceUrl}/wiki/rest/api/space`, data, { headers })
    .catch((error) => error.response);

  if (
    createSpaceResponse &&
    (createSpaceResponse.status === 200 || createSpaceResponse.status === 201)
  ) {
    console.info(
      "Space successfully created:",
      `SpaceKey=${spaceKey}, SpaceName=${spaceName}`
    );
    return true;
  }

  console.error(
    "Error creating Confluence space:",
    createSpaceResponse?.status || "Unknown error"
  );
  return false;
}

/**
 * A function to create a new page in Confluence under a specified space
 * @param spaceKey - The key of the space where the page will be created
 * @param pageTitle - The title of the page to create
 * @param pageContent - The content of the page in Confluence storage format
 * @param confluenceUrl - The URL to the Confluence API endpoint
 * @param authHeader - The authorization header for the Confluence API
 * @returns the created page's data if successful
 */
async function createConfluencePage(
  spaceKey: string,
  pageTitle: string,
  pageContent: string,
  confluenceUrl: string,
  authHeader: string
): Promise<ConfluencePageResponse> {
  console.info(
    "Starting Confluence page creation:",
    `SpaceKey=${spaceKey}, Page Title=${pageTitle}`
  );

  const data = {
    type: "page",
    title: pageTitle,
    space: {
      key: spaceKey,
    },
    body: {
      storage: {
        value: pageContent,
        representation: "storage",
      },
    },
  };

  try {
    const response = await axios.post(
      `${confluenceUrl}/wiki/rest/api/content`,
      data,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    console.info(
      "Confluence page created successfully:",
      `Page Title=${pageTitle}, Page ID=${response.data.id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating Confluence page:",
      `SpaceKey=${spaceKey}, Page Title=${pageTitle}`,
      error
    );
    throw error;
  }
}

/**
 * A function to create a space and post a page to JIRA Confluence
 * @param spaceKey - The key of the space to create or use in Confluence
 * @param spaceName - The name of the space to create or use in Confluence
 * @param pageTitle - The title of the page to create in Confluence
 * @param pageContent - The HTML content of the page in Confluence storage format
 */
export async function postToJiraConfluence(
  spaceKey: string,
  spaceName: string,
  pageTitle: string,
  pageContent: string
): Promise<void> {
  console.info("Starting post to JIRA Confluence request.");

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");

  try {
    if (!JIRA_ORG_URL) {
      console.error("Missing JIRA ORG URL.");
      throw new Error("Missing JIRA ORG URL.");
    }

    const authHeader = await getAuthHeader();

    console.info(
      "Attempting to create or verify Confluence space:",
      `SpaceKey=${spaceKey}, SpaceName=${spaceName}`
    );

    const isSpaceCreated = await createConfluenceSpace(
      spaceKey,
      spaceName,
      JIRA_ORG_URL.toString(),
      authHeader
    );

    if (isSpaceCreated) {
      console.info(
        "Confluence space verified or created successfully:",
        `SpaceKey=${spaceKey}, SpaceName=${spaceName}`
      );

      console.info(
        "Creating a Confluence page:",
        `PageTitle=${pageTitle}, ContentLength=${pageContent.length}`
      );

      const page = await createConfluencePage(
        spaceKey,
        pageTitle,
        pageContent,
        JIRA_ORG_URL.toString(),
        authHeader
      );

      console.info(
        "Confluence page created successfully:",
        `PageTitle=${pageTitle}, PageID=${page.id}`
      );
    }
  } catch (error) {
    console.error("Error during post to JIRA Confluence process:", error);
  }
}
