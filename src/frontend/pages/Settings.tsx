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
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>
      
      <main className="max-w-2xl mx-auto space-y-6">
        <section className="section">
          <h2 className="section-title">API Configuration</h2>
          <button 
            onClick={handleApiKeyChange}
            className="btn-secondary"
          >
            Change Gemini API Key
          </button>
        </section>

        {showApiKeyForm && (
          <section className="section">
            <h3 className="section-title">Update Gemini API Key</h3>
            <GeminiForm onValidSubmit={handleApiKeySaved} isSetup={false} />
          </section>
        )}

        <div className="flex justify-center">
          <button 
            onClick={() => setToDashboard(true)}
            className="nav-button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
