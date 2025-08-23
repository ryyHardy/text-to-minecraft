import { useState } from "react";
import { Navigate } from "react-router";

import { useSetup } from "../contexts/SetupContext";
import GeminiForm from "../components/GeminiForm";

export default function Settings() {
  const { updateSetupStatus } = useSetup();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  const [toDashboard, setToDashboard] = useState(false);

  const handleApiKeyChange = async () => {
    setShowApiKeyForm(true);
  };

  const handleApiKeySaved = async () => {
    setShowApiKeyForm(false);
    await updateSetupStatus();
  };

  if (toDashboard) {
    return <Navigate to='/' />;
  }

  return (
    <main>
      <h1>Settings</h1>
      <section>
        <h2>API Configuration</h2>
        <button onClick={handleApiKeyChange}>Change Gemini API Key</button>
      </section>

      {showApiKeyForm && (
        <section>
          <h3>Update Gemini API Key</h3>
          <GeminiForm onValidSubmit={handleApiKeySaved} />
        </section>
      )}

      <button onClick={() => setToDashboard(true)}>Back to Dashboard</button>
    </main>
  );
}
