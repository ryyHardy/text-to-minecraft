import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SetupContextType = {
  isSetupComplete: boolean;
  updateSetupStatus: () => Promise<void>;
  markSetupComplete: () => void;
};

const SetupContext = createContext<SetupContextType | null>(null);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  const updateSetupStatus = async () => {
    try {
      const apiKeyExists = await window.textmc.secretExists("gemini-api-key");
      setIsSetupComplete(apiKeyExists);
    } catch (error) {
      console.error("Error checking setup status:", error);
      setIsSetupComplete(false);
    }
  };

  const markSetupComplete = () => {
    setIsSetupComplete(true);
  };

  useEffect(() => {
    updateSetupStatus();
  }, []);

  if (isSetupComplete === null) {
    return <div>Loading...</div>;
  }

  return (
    <SetupContext.Provider
      value={{ isSetupComplete, updateSetupStatus, markSetupComplete }}
    >
      {children}
    </SetupContext.Provider>
  );
}

/**
 * Hook to get the setup state within a SetupProvider context
 */
export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
}
