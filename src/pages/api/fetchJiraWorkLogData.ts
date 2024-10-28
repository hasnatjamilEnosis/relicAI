import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import fs from "fs";
import path from "path";

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
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
 * API route handler to fetch JIRA work log data within a specified date range and saves the response in JSON format in the 'downloads' directory
 * @param req - The API request object
 * @param res - The API response object
 * @returns the fetched data or error message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { startDate, endDate } = req.query;

  console.info("Starting JIRA data fetch request.");

  try {
    if (!JIRA_BASE_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
      console.error("Missing JIRA configuration environment variables.");
      throw new Error("Missing JIRA configuration environment variables.");
    }

    if (!startDate || !endDate) {
      console.error("Missing start and end date parameters in request.");
      return res
        .status(400)
        .json({ message: "Start and End dates are required." });
    }

    console.info("Fetching data from JIRA API for dates:", {
      startDate,
      endDate,
    });

    const response = await axios.get(JIRA_BASE_URL, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      params: {
        jql: `worklogDate >= "${startDate}" AND worklogDate <= "${endDate}"`,
        fields:
          "key,summary,timespent,status,comment,assignee,reporter,priority,issuetype,labels,project",
      },
    });

    const issuesData = response.data.issues;

    console.info(
      "Successfully fetched data from JIRA API. Total issues fetched:",
      issuesData.length
    );

    const downloadsPath = path.join(process.cwd(), "downloads");
    const filePath = path.join(downloadsPath, "jiraWorkLogResponse.json");
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath);
      console.info("Created 'downloads' directory.");
    }
    fs.writeFileSync(filePath, JSON.stringify(issuesData, null, 2), "utf8");
    console.info(
      "Data saved to 'jiraWorkLogResponse.json' in 'downloads' directory."
    );

    res.status(200).json({
      message: "Data fetched and saved successfully",
      issues: issuesData,
    });
  } catch (error) {
    console.error("Error fetching issues from JIRA:", error);
    res.status(500).json({ message: "Error fetching issues", error });
  }
}
