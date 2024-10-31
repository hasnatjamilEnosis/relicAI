import { getSettings } from "@/actions/settings/settings-actions";
import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import UpdateSettings from "@/components/forms/settings/update-settings";

export default async function Settings() {
  const { data } = await getSettings();
  const { jiraApiKey, preferredProject, preferredUsers } = data
    ? data
    : { jiraApiKey: "", preferredProject: "", preferredUsers: [] };

  return (
    <div>
      <PageHeader title="Settings" />
      <PageContent>
        <UpdateSettings
          jiraApiKey={jiraApiKey}
          currentSelectedProjectId={preferredProject}
          projectList={[
            { value: "1", label: "Project 1" },
            { value: "2", label: "Project 2" },
            { value: "3", label: "Project 3" },
            { value: "4", label: "Project 4" },
          ]}
          currentSelectedUserIds={preferredUsers.join(",")}
          userList={[
            { value: "1", label: "John" },
            { value: "2", label: "Mark" },
            { value: "3", label: "Robert" },
          ]}
        />
      </PageContent>
    </div>
  );
}
