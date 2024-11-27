import {
  generateSummaryObject,
  getJiraWorkLogData,
} from "@/actions/notes/note-generation-actions";
import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import Editor from "@/components/custom-ui/rich-text-editor";
import { groupByProperty } from "@/utils/dataFormat";
import { generateHTMLTable, HTMLElement } from "@/utils/htmlBuilder";

export default async function Preview({
  searchParams,
}: {
  searchParams: {
    boardId: string;
    sprintId: string;
    projectId: string;
    users: string;
    startDate: string;
    endDate: string;
    customFields: string;
  };
}) {
  const {
    boardId,
    sprintId,
    projectId,
    users,
    startDate,
    endDate,
    customFields,
  } = searchParams;
  const workLogData = await getJiraWorkLogData(projectId, startDate, endDate);
  const userList = users.split(",").map((user) => user.trim());
  const summary = await generateSummaryObject(workLogData, boardId);
  const filteredSummary = summary.filter((item) =>
    userList.includes(item.assignee)
  );
  const groupedByAssigneeSummary = groupByProperty(filteredSummary, "assignee");
  const customFieldsArray = customFields
    .split(",")
    .map((field) => field.trim());

  // note heading
  const meetingNoteHeaderContainer = new HTMLElement("div");
  const meetingNoteHeaderDetailsList = new HTMLElement("ul");
  meetingNoteHeaderDetailsList.addChildren([
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Board: `))
      .addChild(boardId),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Sprint: `))
      .addChild(sprintId),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Project: `))
      .addChild(projectId),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Users: `))
      .addChild(users),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Start Date: `))
      .addChild(startDate),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`End Date: `))
      .addChild(endDate),
    new HTMLElement("li")
      .addChild(new HTMLElement("strong").addChild(`Custom Fields: `))
      .addChild(customFields),
  ]);

  meetingNoteHeaderContainer.addChildren([
    new HTMLElement("h2").addChild("Meeting Note Details"),
    meetingNoteHeaderDetailsList,
  ]);

  // placeholder for assignees without time entries
  const assigneesWithoutTimeEntries = userList.filter(
    (user) => !Object.keys(groupedByAssigneeSummary).includes(user)
  );
  let noTimeEntriesPlaceholder = assigneesWithoutTimeEntries.map((assignee) => {
    const container = new HTMLElement("div");
    const header = new HTMLElement("h3").addChild(
      assignee
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
    const message = new HTMLElement("p").addChild(
      "No time entries found for this assignee for the selected time period."
    );
    return container.addChild(header).addChild(message);
  });

  // time entry breakdown header
  const breakDownHeaderContainer = new HTMLElement("div");
  const breakDownHeader = new HTMLElement("h2").addChild(
    "Time Entry Breakdown"
  );
  breakDownHeaderContainer.addChild(breakDownHeader);

  // HTML data tables for each assignee with time entries
  const htmlDataTables = Object.keys(groupedByAssigneeSummary).map(
    (assignee) => {
      const container = new HTMLElement("div");
      const header = new HTMLElement("h3").addChild(
        assignee
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );
      const table = generateHTMLTable(
        groupedByAssigneeSummary[assignee],
        ["assignee"],
        customFieldsArray
      );
      return container.addChild(header).addChild(table);
    }
  );

  const htmlContent = new HTMLElement("div")
    .addChildren([
      meetingNoteHeaderContainer,
      breakDownHeaderContainer,
      ...htmlDataTables,
      ...noTimeEntriesPlaceholder,
    ])
    .toString();

  return (
    <>
      <PageHeader title="Preview" />
      <PageContent>
        <Editor htmlContent={htmlContent} />
      </PageContent>
    </>
  );
}
