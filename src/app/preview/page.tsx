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
    userIds: string;
    startDate: string;
    endDate: string;
  };
}) {
  const { boardId, sprintId, projectId, userIds, startDate, endDate } =
    searchParams;
  const workLogData = await getJiraWorkLogData(projectId, startDate, endDate);
  const summary = await generateSummaryObject(workLogData, boardId);
  const groupedByAssigneeSummary = groupByProperty(summary, "assignee");
  const htmlDataTables = Object.keys(groupedByAssigneeSummary).map(
    (assignee) => {
      const container = new HTMLElement("div");
      const header = new HTMLElement("h2").addChild(assignee);
      const table = generateHTMLTable(groupedByAssigneeSummary[assignee], [
        "assignee",
      ]);
      return container.addChild(header).addChild(table);
    }
  );

  const htmlContent = new HTMLElement("div")
    .addChildren(htmlDataTables)
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
