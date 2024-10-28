import axios from "axios";

// Define TypeScript interfaces for expected data structure
interface Issue {
  key: string;
  summary: string;
  timespent: number | null;
  status: string;
  comment: string;
  assignee: string | null;
  reporter: string | null;
  priority: string;
  issuetype: string;
  labels: string[];
  project: { key: string; name: string };
}

interface WorkLogDataResponse {
  message: string;
  issues: Issue[];
}

/**
 * Fetches work log data from the JIRA API for a specified date range
 *
 * @param startDate - The start date for fetching work log data (formatted as YYYY-MM-DD)
 * @param endDate - The end date for fetching work log data (formatted as YYYY-MM-DD)
 * @returns the fetched work log data
 */
export const fetchWorkLogData = async (
  startDate: string,
  endDate: string
): Promise<WorkLogDataResponse> => {
  console.info("Initiating fetch for work log data with parameters:", {
    startDate,
    endDate,
  });

  try {
    const response = await axios.get<WorkLogDataResponse>(
      "/api/fetchJiraWorkLogData",
      {
        params: { startDate, endDate },
      }
    );

    console.info(
      "Work log data fetched successfully. Number of entries:",
      response.data.issues.length
    );
    return response.data;
  } catch (error) {
    console.error("Error occurred while fetching work log data:", error);
    throw new Error("Error fetching issues. Please try again.");
  }
};
