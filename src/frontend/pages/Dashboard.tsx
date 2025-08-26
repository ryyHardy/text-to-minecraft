import { useState } from "react";
import { Navigate } from "react-router";

import ConnectForm from "../components/ConnectForm";
import Page from "../components/ui/Page";

export default function Dashboard() {
  const [toSettings, setToSettings] = useState(false);

  if (toSettings) {
    return <Navigate to='/settings' />;
  }

  return (
    <Page
      title='Text-to-Minecraft'
      navRoutes={[{ name: "Settings", route: "/settings" }]}
    >
      <ConnectForm />
    </Page>
  );
}
