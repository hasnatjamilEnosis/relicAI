import {
  getAllJiraProjects,
  getAllUsersFromJira,
  getSettings,
} from "@/actions/settings/settings-actions";
import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import UpdateSettings from "@/components/forms/settings/update-settings";

export default async function Settings() {
  const { data: settingsData } = await getSettings();
  const {
    llamaApiUrl,
    llamaModel,
    jiraOrgUrl,
    jiraAuthUserEmail,
    jiraApiKey,
    preferredProject,
    preferredUsers,
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
        />
      </PageContent>
    </div>
  );
}
