import styles from "./Dashboard.module.css";
import { useState } from "react";
import { Navigate } from "react-router";

import ConnectForm from "../components/ConnectForm";

export default function Dashboard() {
  const [toSettings, setToSettings] = useState(false);

  if (toSettings) {
    return <Navigate to='/settings' />;
  }

  return (
    <>
      <main className={styles.dashboard}>
        <h1 className={styles.title}>Text-to-Minecraft</h1>
        <ConnectForm />
        <button onClick={() => setToSettings(true)}>Settings</button>
      </main>
    </>
  );
}
