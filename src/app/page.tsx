import PageContent from "@/components/custom-ui/page-content";
import PageHeader from "@/components/custom-ui/page-header";

export default function Home() {
  return (
    <div>
      <PageHeader title="Home" />
      <PageContent>
        <p>Home page content</p>
      </PageContent>
    </div>
  );
}
