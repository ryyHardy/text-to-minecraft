import { useEffect, useState } from "react";

import styles from "./App.module.css";

import ConnectForm from "./components/ConnectForm";
import GeminiForm from "./components/GeminiForm";
import Settings from "./components/settings/Settings";

type AppView = "connect" | "gemini" | "settings";

export default function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>("connect");

  useEffect(() => {
    async function checkApiKey() {
      try {
        const exists = await window.textmc.secretExists("gemini-api-key");
        setHasApiKey(exists);
        setCurrentView(exists ? "connect" : "gemini");
      } catch (error) {
        console.error("Error checking API key:", error);
        setHasApiKey(false);
        setCurrentView("gemini");
      } finally {
        setIsLoading(false);
      }
    }

    checkApiKey();
  }, []);

  const handleApiKeySubmitted = () => {
    setHasApiKey(true);
    setCurrentView("connect");
  };

  const handleNavigateToSettings = () => {
    setCurrentView("settings");
  };

  const handleNavigateToConnect = () => {
    setCurrentView("connect");
  };

  const handleApiKeyUpdated = () => {
    setHasApiKey(true);
    setCurrentView("connect");
  };

  const handleApiKeyRemoved = () => {
    setHasApiKey(false);
    setCurrentView("gemini"); // Go back to GeminiForm since no API key exists
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no API key, show GeminiForm
  if (!hasApiKey) {
    return <GeminiForm onApiKeySubmitted={handleApiKeySubmitted} />;
  }

  // If API key exists, show the appropriate view
  switch (currentView) {
    case "settings":
      return <Settings 
        onNavigateBack={handleNavigateToConnect} 
        onApiKeyUpdated={handleApiKeyUpdated}
        onApiKeyRemoved={handleApiKeyRemoved}
      />;
    case "connect":
    default:
      return <ConnectForm onNavigateToSettings={handleNavigateToSettings} />;
  }
}
