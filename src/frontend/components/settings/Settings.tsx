import { useState, useEffect } from "react";
import styles from "./Settings.module.css";

type SettingsProps = {
  onNavigateBack: () => void;
  onApiKeyUpdated: () => void;
  onApiKeyRemoved: () => void;
};

export default function Settings({
  onNavigateBack,
  onApiKeyUpdated,
  onApiKeyRemoved,
}: SettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Check if API key exists on component mount
  useEffect(() => {
    checkApiKeyExists();
  }, []);

  async function checkApiKeyExists() {
    try {
      const exists = await window.textmc.secretExists("gemini-api-key");
      setApiKeyExists(exists);
    } catch (error) {
      console.error("Error checking API key existence:", error);
      setError("Failed to check API key status");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate the API key before saving
      const isValid = await window.textmc.validateLLMKey(apiKey);
      if (!isValid) {
        setError(
          "Invalid API key. Please check your Gemini API key and try again."
        );
        return;
      }

      // Save the API key
      await window.textmc.setSecret("gemini-api-key", apiKey);
      setSuccess("API key saved successfully!");
      setApiKeyExists(true);
      setApiKey(""); // Clear the input
      onApiKeyUpdated(); // Notify parent component
    } catch (error) {
      setError("Failed to save API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <header className={styles.header}>
          <h2>Settings</h2>
          <button
            className={styles.backButton}
            onClick={onNavigateBack}
          >
            ← Back
          </button>
        </header>

        <section className={styles.section}>
          <h3>AI Settings</h3>

          {apiKeyExists === true && (
            <div className={styles.warning}>
              <p>⚠️ A Gemini API key is already configured.</p>
              <p>Entering a new key will replace the existing one.</p>
            </div>
          )}

          <label
            className={styles.label}
            htmlFor='apikey-input'
          >
            Gemini API Key:
          </label>
          <input
            className={styles.input}
            type='password'
            id='apikey-input'
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={
              apiKeyExists
                ? "Enter new API key to replace existing one"
                : "Paste Gemini API Key Here"
            }
            disabled={isLoading}
          />

          {apiKeyExists === true && (
            <button
              type='button'
              className={styles.secondaryButton}
              onClick={async () => {
                try {
                  await window.textmc.setSecret("gemini-api-key", "");
                  setApiKeyExists(false);
                  setSuccess("API key removed successfully!");
                  onApiKeyRemoved(); // Call the removal callback instead
                } catch (error) {
                  setError("Failed to remove API key");
                }
              }}
              disabled={isLoading}
            >
              Remove API Key
            </button>
          )}
        </section>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button
          className={styles.button}
          type='submit'
          disabled={isLoading || !apiKey.trim()}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
