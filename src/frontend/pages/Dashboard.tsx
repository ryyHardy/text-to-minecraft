import ConnectForm from "../components/ConnectForm";
import Page from "../components/ui/Page";

export default function Dashboard() {
  return (
    <Page
      title='Text-to-Minecraft'
      navItems={[{ name: "Settings", route: "/settings" }]}
      contentClassName='grid place-content-center'
    >
      <ConnectForm />
    </Page>
  );
}
