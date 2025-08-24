import { useState } from "react";
import { Navigate } from "react-router";

import ConnectForm from "../components/ConnectForm";

export default function Dashboard() {
  const [toSettings, setToSettings] = useState(false);

  if (toSettings) {
    return <Navigate to='/settings' />;
  }

  return (
    <div className='page-container'>
      <header className='page-header'>
        <h1 className='page-title'>Text-to-Minecraft</h1>
      </header>

      <main className='flex flex-col items-center space-y-6'>
        <ConnectForm />

        <button
          onClick={() => setToSettings(true)}
          className='nav-button'
        >
          ⚙️ Settings
        </button>
      </main>
    </div>
  );
}
