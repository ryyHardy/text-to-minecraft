import { useState } from "react";
import styles from "./Setup.module.css";

import { useSetup } from "../contexts/SetupContext";

export default function Setup() {
  const { markSetupComplete } = useSetup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitGeminiKey(key: string): Promise<boolean> {
    try {
      const isValid = await window.textmc.validateLLMKey(key);
      if (isValid) {
        window.textmc.setSecret("gemini-api-key", key);
        return true;
      } else {
        setError("Invalid API key. Please check your key and try again.");
        return false;
      }
    } catch (_) {
      setError("Error validating API key. Please try again.");
      return false;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.target as HTMLFormElement);

    const geminiKey = formData.get("geminikey-input") as string;
    const success = await handleSubmitGeminiKey(geminiKey);

    if (success) {
      markSetupComplete();
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <header>
        <h1>Setup</h1>
        {error && (
          <div className={`${styles.message} ${styles.error}`}>{error}</div>
        )}
      </header>
      <main>
        <form
          className={styles.setup}
          onSubmit={handleSubmit}
        >
          <section>
            <h2>API Key</h2>
            <div className={styles.apiKeyNotice}>
              The Minecraft bot is powered by Google's Gemini API, so you need
              to provide a Gemini API key below that will be used for the bot's
              AI features. You can get one for free (with a solid free tier)
              using <a href='https://aistudio.google.com/'>Google AI Studio</a>.
              When submitted, the key is validated, encrypted, and stored on
              your machine to keep it safe. So, ensure you have taken note of it
              before submitting.
            </div>
            <label htmlFor='geminikey-input'>Gemini API Key:</label>
            <input
              required
              type='password'
              name='geminikey-input'
              placeholder='Paste Gemini API Key Here'
              spellCheck={false}
              disabled={isSubmitting}
            />
          </section>

          <button
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? "Validating..." : "Submit"}
          </button>
        </form>
      </main>
    </>
  );
}
