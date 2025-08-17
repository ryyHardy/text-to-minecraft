import { useEffect, useState } from "react";

import styles from "./App.module.css";

import ConnectForm from "./components/ConnectForm";
import GeminiForm from "./components/GeminiForm";

export default function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkApiKey() {
      try {
        const exists = await window.textmc.secretExists("gemini-api-key");
        setHasApiKey(exists);
      } catch (error) {
        console.error("Error checking API key:", error);
        setHasApiKey(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkApiKey();
  }, []);

  const handleApiKeySubmitted = () => {
    setHasApiKey(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return hasApiKey ? (
    <ConnectForm />
  ) : (
    <GeminiForm onApiKeySubmitted={handleApiKeySubmitted} />
  );
}
