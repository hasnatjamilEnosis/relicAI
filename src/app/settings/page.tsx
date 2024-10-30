"use client";

import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import UpdateSettings from "@/components/forms/settings/update-settings";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" />
      <PageContent>
        <UpdateSettings
          jiraApiKey="12345678912345678921"
          currentSelectedProjectId="1"
          projectList={[
            { value: "1", label: "Project 1" },
            { value: "2", label: "Project 2" },
            { value: "3", label: "Project 3" },
            { value: "4", label: "Project 4" },
          ]}
          currentSelectedUserIds="1, 2"
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
