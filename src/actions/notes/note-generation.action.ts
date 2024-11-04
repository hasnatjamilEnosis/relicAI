"use server";

import axios from "axios";

const JIRA_ORG_URL = process.env.JIRA_ORG_URL;
const JIRA_USERNAME = process.env.JIRA_USERNAME;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const LLAMA_PORT = process.env.LLAMA_PORT;
const LLAMA_MODEL = process.env.LLAMA_MODEL;

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

/**
 * A function to fetch the boards for a specific project in JIRA by project name
 * @param projectName - The name of the project
 * @returns an array of boards for the specified project
 */
export async function getJiraProjectBoardNames(projectName: string) {
  console.info("Starting board fetch for project:", projectName);

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

    const response = await axios.get(`${JIRA_ORG_URL}/rest/agile/1.0/board`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      params: { projectKey },
    });

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error(`No boards found for project with key ${projectKey}.`);
    }

    const boards = response.data.values.map(
      (board: { id: number; name: string; type: string }) => ({
        id: board.id,
        name: board.name,
        type: board.type,
      })
    );

    console.info(
      "Successfully fetched boards for project:",
      projectName,
      ". Total boards fetched:",
      boards.length
    );
    return boards;
  } catch (error) {
    console.error("Error fetching boards from JIRA:", error);
  }
}

/**
 * A function to fetch sprints for a specific board in JIRA by board name
 * @param boardName - The name of the board
 * @returns an array of sprints for the specified board
 */
export async function getJiraSprintsByBoardName(boardName: string) {
  console.info("Starting sprint fetch for board name:", boardName);

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!boardName) {
      console.error("Board name is required.");
      throw new Error("Board name is required.");
    }

    const boardId = await getJiraBoardIdByName(boardName);
    if (!boardId) {
      throw new Error(`Board with name ${boardName} not found.`);
    }

    const response = await axios.get(
      `${JIRA_ORG_URL}/rest/agile/1.0/board/${boardId}/sprint`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error(`No sprints found for board name ${boardName}.`);
    }

    const sprints = response.data.values.map(
      (sprint: {
        id: number;
        name: string;
        state: string;
        startDate: string;
        endDate: string;
      }) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      })
    );

    console.info(
      "Successfully fetched sprints for board name:",
      boardName,
      ". Total sprints fetched:",
      sprints.length
    );
    return sprints;
  } catch (error) {
    console.error("Error fetching sprints from JIRA:", error);
  }
}

/**
 * A function to fetch the JIRA board ID by board name
 * @param boardName - The name of the board
 * @returns the board ID for the specified board name
 */
export async function getJiraBoardIdByName(boardName: string) {
  console.info("Starting fetch for board ID with name:", boardName);

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!boardName) {
      console.error("Board name is required.");
      throw new Error("Board name is required.");
    }

    const response = await axios.get(`${JIRA_ORG_URL}/rest/agile/1.0/board`, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error(`No boards found.`);
    }

    const board = response.data.values.find(
      (b: { id: number; name: string }) => b.name === boardName
    );

    if (!board) {
      throw new Error(`Board with name ${boardName} not found.`);
    }

    console.info(
      "Successfully fetched board ID for board name:",
      boardName,
      ". Board ID:",
      board.id
    );
    return board.id;
  } catch (error) {
    console.error("Error fetching board ID from JIRA:", error);
  }
}

/**
 * A function to interact or analyze content using the locally installed LLAMA model
 * @param prompt - The prompt to be passed to the LLAMA model
 * @param fileContent - Optional; the content of a file to be analyzed, if available
 * @returns the reply from the LLAMA model
 */
export async function interactWithLlama(
  prompt: string,
  fileContent: string | undefined = undefined
) {
  console.info("Starting interaction with LLAMA model.");

  try {
    if (!LLAMA_PORT || !LLAMA_MODEL) {
      console.error("Missing LLAMA configuration environment variables.");
      throw new Error("Missing LLAMA configuration environment variables.");
    }

    const llamaEndpoint = `http://localhost:${LLAMA_PORT}/api/chat`;

    const data = {
      model: `${LLAMA_MODEL}`,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
      ],
      stream: false,
    };

    if (fileContent) {
      data.messages.push({
        role: "user",
        content: `${fileContent}`,
      });
    }

    if (!prompt) {
      console.error("Prompt text is required.");
      throw new Error("Prompt text is required.");
    }

    data.messages.push({
      role: "user",
      content: `${prompt}`,
    });

    const response = await axios.post(llamaEndpoint, data);

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format from LLAMA model.");
    }

    const llamaReply = response.data.message.content;

    if (!llamaReply) {
      throw new Error(`No reply was returned from LLAMA model.`);
    }

    console.info("Reply from LLAMA model:", llamaReply);
    return llamaReply;
  } catch (error) {
    console.error("Error during LLAMA model interaction:", error);
  }
}
