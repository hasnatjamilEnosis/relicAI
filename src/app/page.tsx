import { getSettings } from "@/actions/cache/settings-cache";
import {
  getAllJiraBoards,
  getAllJiraSprints,
} from "@/actions/notes/note-generation-actions";
import {
  getAllJiraProjects,
  getAllUsersFromJira,
} from "@/actions/settings/settings-actions";
import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import GenerateNote from "@/components/forms/notes/generate-note";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CircleX } from "lucide-react";

export default async function Home() {
  const settings = await getSettings();
  const { preferredUsers = "", preferredProject = "" } = settings || {
    preferredUsers: "",
    jiraApiKey: "",
    jiraBaseUrl: "",
    jiraEmail: "",
    jiraProjectId: "",
    jiraProjectKey: "",
    jiraSprintId: "",
    jiraSprintName: "",
  };

  const { data: projectListData = [] } = await getAllJiraProjects();
  const { data: userListData = [] } = await getAllUsersFromJira();
  const { data: boardList } = await getAllJiraBoards();
  const { data: sprintList } = await getAllJiraSprints();

  return (
    <div>
      <PageHeader title="Home" />
      <PageContent>
        {!settings ? (
          <Alert className="fixed top-10 left-1/2 w-fit transform -translate-x-1/2 translate-y-0 bg-pink-600">
            <div className="flex items-center gap-4">
              <CircleX className="h-6 w-6" />
              <div>
                <div className="mb-2 w-fit">
                  <AlertTitle className="text-lg">Error!</AlertTitle>
                  <Separator className="bg-white" />
                </div>
                <AlertDescription className="text-xs">
                  Settings is not configured. PLease update settings in the
                  settings page.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ) : (
          <GenerateNote
            preferredProjectId={preferredProject}
            preferredUsers={
              Array.isArray(preferredUsers)
                ? preferredUsers.join(", ")
                : preferredProject
            }
            projectList={projectListData}
            allUsersList={userListData}
            boardList={boardList || []}
            sprintList={sprintList || []}
          />
        )}
      </PageContent>
    </div>
  );
}
