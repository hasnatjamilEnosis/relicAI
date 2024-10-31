"use server";

import axios from "axios";

const JIRA_ORG_URL = process.env.JIRA_ORG_URL;
const JIRA_USERNAME = process.env.JIRA_USERNAME;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

/**
 * Generates the Authorization header using Basic Auth for JIRA API requests
 * @returns the base64 encoded authorization header
 */
const getAuthHeader = () => {
  const token = Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString(
    "base64"
  );
  return `Basic ${token}`;
};

/**
 * A function to fetch the project names from a JIRA organization
 * @returns an array of project names from the JIRA organization
 */
export async function getJiraProjectNames() {
  console.info("Starting JIRA project names fetch request.");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    console.info("Fetching project names from JIRA organization.");

    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/project`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error(
        `Failed to fetch JIRA project names: ${response.statusText}`
      );
    }

    const projectNames = response.data.map(
      (project: { name: string }) => project.name
    );
    console.info(
      "Successfully fetched project names from JIRA API. Total projects fetched:",
      projectNames.length
    );
    return projectNames;
  } catch (error) {
    console.error("Error fetching project names from JIRA:", error);
  }
}

/**
 * A function to fetch the project key from a given project name in JIRA
 * @param projectName - The name of the project
 * @returns the project key corresponding to the given project name
 */
export async function getProjectKeyByName(
  projectName: string
): Promise<string | undefined> {
  console.info("Starting project key fetch for project name:", projectName);

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!projectName) {
      console.error("Project name is required.");
      throw new Error("Project name is required.");
    }

    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/project`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const project = response.data.find(
      (p: { name: string }) => p.name === projectName
    );

    if (!project) {
      console.warn(`Project with name ${projectName} not found.`);
      return undefined;
    }

    console.info(
      "Project key found for project:",
      projectName,
      "->",
      project.key
    );
    return project.key;
  } catch (error) {
    console.error("Error fetching project key from JIRA:", error);
  }
}

/**
 * A function to fetch JIRA work log data of any specific project within a specified date range
 * @param projectName - The name of the project
 * @param startDate - The start date of the expected work log data
 * @param endDate - The end date of the expected work log data
 * @returns the fetched work log data
 */
export async function getJiraWorkLogData(
  projectName: string,
  startDate: string,
  endDate: string
) {
  console.info("Starting JIRA work log data fetch request.");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!projectName || !startDate || !endDate) {
      console.error("Missing function parameter value(s).");
      throw new Error("Missing function parameter value(s).");
    }

    console.info("Fetching work log data from JIRA:", {
      projectName,
      startDate,
      endDate,
    });

    const projectKey = await getProjectKeyByName(projectName);
    if (!projectKey) {
      throw new Error(`Project with name ${projectName} not found.`);
    }
    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/search`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      params: {
        jql: `project = ${projectKey} AND worklogDate >= ${startDate} AND worklogDate <= ${endDate}`,
        fields:
          "key,summary,timespent,status,comment,assignee,reporter,priority,issuetype,labels,project",
      },
    });

    if (!response.data.issues) {
      throw new Error(
        `Failed to fetch JIRA work log data: ${response.statusText}`
      );
    }

    const workLogData = response.data.issues;
    console.info(
      "Successfully fetched work log data from JIRA API. Total item fetched:",
      workLogData.length
    );
    return workLogData;
  } catch (error) {
    console.error("Error fetching work log data from JIRA:", error);
  }
}

/**
 * A function to fetch the members for a specific project in JIRA
 * @param projectName - The name of the project
 * @returns an array of members for the specified project
 */
export async function getJiraProjectMembers(projectName: string) {
  console.info("Starting JIRA project members fetch for project:", projectName);

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!projectName) {
      console.error("Project name is required.");
      throw new Error("Project name is required.");
    }

    const projectKey = await getProjectKeyByName(projectName);
    if (!projectKey) {
      throw new Error(`Project with name ${projectName} not found.`);
    }

    const rolesResponse = await axios.get(
      `${JIRA_ORG_URL}/rest/api/3/project/${projectKey}/role`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!rolesResponse.data) {
      throw new Error(
        `Failed to fetch roles for project with key ${projectKey}.`
      );
    }

    const roleUrls = Object.entries(rolesResponse.data)
      .filter(
        ([roleName]) => roleName === "Administrator" || roleName === "Member"
      )
      .map(([, roleUrl]) => roleUrl as string);
    let projectMembers: { displayName: string; emailAddress: string }[] = [];

    for (const roleUrl of roleUrls) {
      const roleResponse = await axios.get(roleUrl as string, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (roleResponse.data && roleResponse.data.actors) {
        const members = roleResponse.data.actors.map(
          (actor: { displayName: string; emailAddress: string }) => ({
            displayName: actor.displayName,
            emailAddress: actor.emailAddress,
          })
        );

        projectMembers = projectMembers.concat(members);
      }
    }

    console.info(
      "Successfully fetched members for project:",
      projectName,
      ". Total members fetched:",
      projectMembers.length
    );
    return projectMembers;
  } catch (error) {
    console.error("Error fetching project members from JIRA:", error);
  }
}
