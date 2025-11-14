import ConnectForm from "../components/ConnectForm";
import Page from "../components/ui/Page";
import ActivityLog from "../components/ActivityLog";

export default function Dashboard() {
  return (
    <Page
      title='Text-to-Minecraft'
      navItems={[{ name: "Settings", route: "/settings" }]}
      contentClassName='grid place-content-center'
    >
      <ConnectForm />
      <ActivityLog />
    </Page>
  );
}
