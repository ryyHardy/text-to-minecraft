import { useState } from "react";

import Page from "../components/ui/Page";

import { useSetup } from "../contexts/SetupContext";
import GeminiForm from "../components/GeminiForm";
import Button from "../components/ui/Button";

export default function Settings() {
  const { updateSetupStatus } = useSetup();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  const handleApiKeySaved = async () => {
    setShowApiKeyForm(false);
    await updateSetupStatus();
  };

  return (
    <Page
      title='Settings'
      navItems={[{ name: "← Back to Dashboard", route: "/" }]}
    >
      <section className='max-w-2xl mx-auto p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>API Configuration</h2>
            <p className='text-text-3'>Manage your Gemini API key</p>
          </div>
          <Button onClick={() => setShowApiKeyForm((s) => !s)}>
            {showApiKeyForm ? "Cancel" : "Change API Key"}
          </Button>
        </div>

        {showApiKeyForm && (
          <div className='p-4 rounded-md border border-border-1 bg-bg-surface-1'>
            <h3 className='font-semibold mb-2'>Update Gemini API Key</h3>
            <GeminiForm onValidSubmit={handleApiKeySaved} isSetup={false} />
          </div>
        )}
      </section>
    </Page>
  );
}
