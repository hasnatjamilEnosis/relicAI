import { getSettings } from "@/actions/cache/settings-cache";
import {
  getAllJiraProjects,
  getAllUsersFromJira,
} from "@/actions/settings/settings-actions";
import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import UpdateSettings from "@/components/forms/settings/update-settings";

export default async function Settings() {
  const settingsData = await getSettings();
  const {
    llamaApiUrl,
    llamaModel,
    jiraOrgUrl,
    jiraAuthUserEmail,
    jiraApiKey,
    preferredProject,
    preferredUsers,
    confluenceSpaceName,
    confluenceSpaceKey,
  } = settingsData
    ? settingsData
    : {
        llamaApiUrl: "",
        llamaModel: "",
        jiraOrgUrl: "",
        jiraAuthUserEmail: "",
        jiraApiKey: "",
        preferredProject: "",
        preferredUsers: [],
        confluenceSpaceName: "",
        confluenceSpaceKey: "",
      };

  let { data: projectListData } = await getAllJiraProjects();
  if (!projectListData) {
    projectListData = [];
  }

  let { data: userListData } = await getAllUsersFromJira();
  if (!userListData) {
    userListData = [];
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <PageContent>
        <UpdateSettings
          llamaModel={llamaModel}
          llamaApiUrl={llamaApiUrl}
          jiraAuthUserEmail={jiraAuthUserEmail}
          jiraOrgUrl={jiraOrgUrl}
          jiraApiKey={jiraApiKey}
          currentSelectedProjectId={preferredProject}
          projectList={projectListData}
          currentSelectedUserIds={preferredUsers.join(",")}
          userList={userListData}
          confluenceSpaceName={confluenceSpaceName}
          confluenceSpaceKey={confluenceSpaceKey}
        />
      </PageContent>
    </div>
  );
}
