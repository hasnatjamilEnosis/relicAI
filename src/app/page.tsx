import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";
import Editor from "@/components/custom-ui/rich-text-editor";

export default function Home() {
  return (
    <div>
      <PageHeader title="Home" />
      <PageContent>
        <Editor />
      </PageContent>
    </div>
  );
}
