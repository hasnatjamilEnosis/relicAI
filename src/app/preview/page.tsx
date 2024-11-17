import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import Editor from "@/components/custom-ui/rich-text-editor";

export default function Preview() {
  return (
    <>
      <PageHeader title="Preview" />
      <PageContent>
        <Editor />
      </PageContent>
    </>
  );
}
