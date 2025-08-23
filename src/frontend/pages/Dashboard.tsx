import { useState } from "react";
import { Navigate } from "react-router";

import ConnectForm from "../components/ConnectForm";

export default function Dashboard() {
  const [toSettings, setToSettings] = useState(false);

  if (toSettings) {
    return <Navigate to='/settings' />;
  }

  return (
    <main>
      <h1>Text-to-Minecraft</h1>
      <ConnectForm />
      <button onClick={() => setToSettings(true)}>Settings</button>
    </main>
  );
}
