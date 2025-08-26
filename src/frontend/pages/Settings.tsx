import { useState } from "react";

import Page from "../components/ui/Page";

import { useSetup } from "../contexts/SetupContext";
import GeminiForm from "../components/GeminiForm";

export default function Settings() {
  const { updateSetupStatus } = useSetup();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  const handleApiKeyChange = async () => {
    setShowApiKeyForm(true);
  };

  const handleApiKeySaved = async () => {
    setShowApiKeyForm(false);
    await updateSetupStatus();
  };

  return (
    <Page
      title='Settings'
      navRoutes={[{ name: "← Back to Dashboard", route: "/" }]}
    >
      <section>
        <h2>API Configuration</h2>
        <button onClick={handleApiKeyChange}>Change Gemini API Key</button>
      </section>

      {showApiKeyForm && (
        <section>
          <h3>Update Gemini API Key</h3>
          <GeminiForm
            onValidSubmit={handleApiKeySaved}
            isSetup={false}
          />
        </section>
      )}
    </Page>
  );
}
