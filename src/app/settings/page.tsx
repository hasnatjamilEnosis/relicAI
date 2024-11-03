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
    jiraOrgUrl,
    jiraAuthUserEmail,
    jiraApiKey,
    preferredProject,
    preferredUsers,
  } = settingsData
    ? settingsData
    : {
        jiraOrgUrl: "",
        jiraAuthUserEmail: "",
        jiraApiKey: "",
        preferredProject: "",
        preferredUsers: [],
      };

  const { data: projectListData } = (await getAllJiraProjects()) || [];

  const { data: userListData } = (await getAllUsersFromJira()) || [];

  return (
    <div>
      <PageHeader title="Settings" />
      <PageContent>
        <UpdateSettings
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
