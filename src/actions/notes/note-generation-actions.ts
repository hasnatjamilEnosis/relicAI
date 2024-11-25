"use server";

import axios from "axios";
import { getSettings } from "../cache/settings-cache";
import { Settings } from "@prisma/client";
import { handleAction } from "@/utils/actionHandler";
import { getAllJiraProjects } from "../settings/settings-actions";

interface commentBodyContent {
  type: string;
  text?: string;
  content?: commentBodyContent[];
}

interface jiraWorkLogApiResponse {
  key: string;
  fields: {
    summary?: string;
    assignee?: {
      displayName?: string;
    };
    timespent?: number;
    status?: {
      statusCategory?: {
        name?: string;
      };
    };
    comment?: {
      comments: {
        body: {
          type: string;
          content: {
            type: string;
            text?: string;
            content?: {
              type: string;
              text?: string;
            }[];
          }[];
        };
      }[];
    };
  };
}

interface formattedSummaryObject {
  key: string;
  summary: string;
  assignee: string;
  spentTime: number;
  storyPoint: number | string;
  status: string;
  aiRemarks: string;
}

const getSettingsProperty = async (property: keyof Settings) => {
  const settings = await getSettings();

  if (!settings)
    throw new Error(
      "Settings not found. Please ensure that you have set up all the required settings in the settings page."
    );

  return settings[property];
};

/**
 * Generates the Authorization header using Basic Auth for JIRA API requests
 * @returns the base64 encoded authorization header
 */
const getAuthHeader = async () => {
  const jiraAuthUserEmail = await getSettingsProperty("jiraAuthUserEmail");
  const jiraApiKey = await getSettingsProperty("jiraApiKey");

  const token = Buffer.from(`${jiraAuthUserEmail}:${jiraApiKey}`).toString(
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

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    console.info("Fetching project names from JIRA organization.");

    const authHeader = await getAuthHeader();
    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/project`, {
      headers: {
        Authorization: authHeader,
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

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!projectName) {
      console.error("Project name is required.");
      throw new Error("Project name is required.");
    }

    const authHeader = await getAuthHeader();
    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/project`, {
      headers: {
        Authorization: authHeader,
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
 * A function to fetch JIRA work log data of any specific project or sprint within a specified date range
 * @param projectKey - The key of the project
 * @param startDate - The start date of the expected work log data
 * @param endDate - The end date of the expected work log data
 * @param sprintId - The optional sprint ID
 * @returns the fetched work log data
 */
export async function getJiraWorkLogData(
  projectKey: string,
  startDate: string,
  endDate: string,
  sprintId?: string
) {
  console.info("Starting JIRA work log data fetch request.");

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!projectKey || !startDate || !endDate) {
      console.error("Missing function parameter value(s).");
      throw new Error("Missing function parameter value(s).");
    }

    console.info("Fetching work log data from JIRA:", {
      projectKey,
      startDate,
      endDate,
      sprintId,
    });

    const authHeader = await getAuthHeader();
    let jql: string;

    if (sprintId) {
      const sprintResponse = await axios.get(
        `${JIRA_ORG_URL}/rest/agile/1.0/sprint/${sprintId}/issue`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!sprintResponse.data.issues) {
        throw new Error(
          `Failed to fetch issues for sprint ${sprintId}: ${sprintResponse.statusText}`
        );
      }

      const issueKeys = sprintResponse.data.issues.map(
        (issue: jiraWorkLogApiResponse) => issue.key
      );
      jql = `issueKey in (${issueKeys.join(",")})`;
    } else {
      jql = `project = ${projectKey} AND worklogDate >= ${startDate} AND worklogDate <= ${endDate} AND timespent > 0`;
    }

    const response = await axios.get(`${JIRA_ORG_URL}/rest/api/3/search`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      params: {
        jql: jql,
        fields: "key,summary,comment,timespent,assignee,status",
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

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

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

    const authHeader = await getAuthHeader();
    const rolesResponse = await axios.get(
      `${JIRA_ORG_URL}/rest/api/3/project/${projectKey}/role`,
      {
        headers: {
          Authorization: authHeader,
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
          Authorization: authHeader,
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
export async function getAllJiraBoardsByProjectKey(projectKey: string) {
  return handleAction(async () => {
    const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
    const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
    const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      throw new Error("Missing JIRA configuration environment variables.");
    }

    const authHeader = await getAuthHeader();
    const response = await axios.get(`${JIRA_ORG_URL}/rest/agile/1.0/board`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      params: { projectKey },
    });

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error(`No boards found for project with key ${projectKey}.`);
    }

    const boards = response.data.values.map(
      (board: { id: number; name: string; type: string }) => ({
        value: board.id,
        label: board.name,
        type: board.type,
      })
    );

    return boards;
  });
}

export async function getAllJiraBoards() {
  return handleAction(async () => {
    const { data } = await getAllJiraProjects();
    if (!data) {
      throw new Error("No projects found");
    }
    const projectKeys: string[] = data.map(
      (project: { value: string; label: string }) => project.value
    );
    const boardPromises = projectKeys.map(async (key) => {
      const { data } = await getAllJiraBoardsByProjectKey(key);
      return {
        projectKey: key,
        boards: data as { value: string; label: string; type: string }[],
      };
    });
    const boardData = await Promise.all(boardPromises);
    return boardData;
  });
}

export async function getAllJiraSprints() {
  return handleAction(async () => {
    const { data } = await getAllJiraBoards();
    if (!data) {
      throw new Error("No boards found");
    }
    const projectBoardIds = data
      .map((project) =>
        project.boards.map((board) => ({
          projectKey: project.projectKey,
          boardId: board.value,
          boardName: board.label,
        }))
      )
      .flat();
    const sprintPromises = projectBoardIds.map(async (board) => {
      const { data } = await getAllJiraSprintsByBoardId(board.boardId);
      return {
        projectKey: board.projectKey,
        boardId: board.boardId,
        boardName: board.boardName,
        sprints: data as { value: string; label: string }[],
      };
    });
    const sprintData = await Promise.all(sprintPromises);
    const filteredSprintData = sprintData.filter(
      (segment) => segment.sprints !== null && segment.sprints.length > 0
    );
    return filteredSprintData;
  });
}

/**
 * A function to fetch sprints for a specific board in JIRA by board name
 * @param boardName - The name of the board
 * @returns an array of sprints for the specified board
 */
export async function getAllJiraSprintsByBoardId(boardId: string) {
  return handleAction(async () => {
    const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
    const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
    const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!boardId) {
      throw new Error(`No board ID provided.`);
    }

    const authHeader = await getAuthHeader();
    const response = await axios.get(
      `${JIRA_ORG_URL}/rest/agile/1.0/board/${boardId}/sprint`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.values || response.data.values.length === 0) {
      throw new Error(`No sprints found for board id ${boardId}.`);
    }

    const sprints = response.data.values.map(
      (sprint: {
        id: number;
        name: string;
        state: string;
        startDate: string;
        endDate: string;
      }) => ({
        value: sprint.id,
        label: sprint.name,
      })
    );
    return sprints;
  });
}

/**
 * A function to fetch the JIRA board ID by board name
 * @param boardName - The name of the board
 * @returns the board ID for the specified board name
 */
export async function getJiraBoardIdByName(boardName: string) {
  console.info("Starting fetch for board ID with name:", boardName);

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!boardName) {
      console.error("Board name is required.");
      throw new Error("Board name is required.");
    }

    const authHeader = await getAuthHeader();
    const response = await axios.get(`${JIRA_ORG_URL}/rest/agile/1.0/board`, {
      headers: {
        Authorization: authHeader,
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

  const LLAMA_API_URL = await getSettingsProperty("llamaApiUrl");
  const LLAMA_MODEL = await getSettingsProperty("llamaModel");

  try {
    if (!LLAMA_API_URL || !LLAMA_MODEL) {
      console.error("Missing LLAMA configuration environment variables.");
      throw new Error("Missing LLAMA configuration environment variables.");
    }

    const llamaEndpoint = `${LLAMA_API_URL}/api/chat`;

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

/**
 * A function to fetch the story points of a Jira issue
 * @param issueId - The ID of the Jira issue
 * @param boardId - The ID of the Jira board
 * @returns the story points of the issue, or null if not found.
 */
export async function getJiraIssueStoryPoints(
  issueId: string,
  boardId: string
) {
  console.info(
    `Starting to fetch story points for issue ID: ${issueId} and board ID: ${boardId}`
  );

  const JIRA_ORG_URL = await getSettingsProperty("jiraOrgUrl");
  const JIRA_USERNAME = await getSettingsProperty("jiraAuthUserEmail");
  const JIRA_API_TOKEN = await getSettingsProperty("jiraApiKey");

  try {
    if (!JIRA_ORG_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!issueId || !boardId) {
      console.error("Jira issue id and board id are required.");
      throw new Error("Jira issue id and board id are required.");
    }

    const authHeader = await getAuthHeader();
    const storyPointFieldResponse = await axios.get(
      `${JIRA_ORG_URL}/rest/agile/1.0/issue/${issueId}/estimation?boardId=${boardId}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !storyPointFieldResponse.data ||
      !storyPointFieldResponse.data.fieldId
    ) {
      throw new Error("No story point field data found.");
    }

    const fieldId = storyPointFieldResponse.data.fieldId;
    console.info(`Field ID: ${fieldId}`);

    const storyPointResponse = await axios.get(
      `${JIRA_ORG_URL}/rest/agile/1.0/issue/${issueId}?fields=${fieldId}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!storyPointResponse.data || !storyPointResponse.data.fields) {
      throw new Error("No story point data found.");
    }

    const storyPoints = storyPointResponse.data.fields[fieldId];

    if (storyPoints === null) {
      console.warn(`Story points not found for issue: ${issueId}`);
      return 0;
    } else {
      console.info(`Story points for issue ${issueId}: ${storyPoints}`);
      return Number(storyPoints);
    }
  } catch (error) {
    console.error("Error fetching story points from JIRA:", error);
  }
}

/**
 * A function to recursively extracts plain text from an array of content objects, skipping code blocks
 * @param commentBody - Array of content objects to process
 * @returns extracted plain text, concatenated with spaces
 */
function extractText(commentBody: commentBodyContent[]): string {
  return commentBody
    .map((item) => {
      if (item.type === "codeBlock") {
        return "";
      }
      if (item.type === "text") {
        return item.text || "";
      }
      if (item.content) {
        return extractText(item.content);
      }
      return "";
    })
    .join(" ");
}

/**
 * A function to process the Jira work log api response data and returns a formatted summary object
 * @param data - Jira work log api response
 * @param boardId - Jira board id
 * @returns a promise that resolves to an formatted object with issue details
 */
export async function generateSummaryObject(
  data: jiraWorkLogApiResponse[],
  boardId: string
): Promise<formattedSummaryObject[]> {
  let summaryObject: formattedSummaryObject;
  const summaryArray: formattedSummaryObject[] = [];
  console.log("Starting to process Jira work log data.");

  const promises = data.map(async (issue) => {
    try {
      const key = issue.key;
      console.log(`Processing issue: ${key}`);

      const summary = issue.fields.summary ?? "";
      const assignee = issue.fields.assignee?.displayName ?? "";
      const spentTime = issue.fields.timespent ?? 0;
      const storyPoint = await getJiraIssueStoryPoints(key, boardId);
      const status = issue.fields.status?.statusCategory?.name ?? "";

      const comments =
        issue.fields.comment?.comments
          .map((comment, index) => {
            const textContent = extractText(comment.body.content);
            return `Comment-${index + 1}: ${textContent}`;
          })
          .join(" ") || "";

      const aiRemarks =
        comments === ""
          ? ""
          : await interactWithLlama(
              `Analyze the provided comments of the JIRA issue titled "${summary}". Provide an optimized current task status of the issue in a single line. The status of the JIRA issue is "${status}". Consider the JIRA title and status for optimal and consistent result, do not include them in the result. Also, do not add any prefix, suffix, suggestions or note.`,
              comments
            );

      summaryObject = {
        key: key,
        summary: summary,
        assignee: assignee,
        spentTime: spentTime,
        storyPoint: storyPoint === undefined ? "N/A" : Number(storyPoint),
        status: status,
        aiRemarks: aiRemarks,
      };
      summaryArray.push(summaryObject);
    } catch (error) {
      console.error(
        `Error during processing the Jira work log data and formatting the summary object`,
        error
      );
    }
  });

  return Promise.all(promises).then(() => {
    console.log("Completed processing all issues.");
    return summaryArray;
  });
}
