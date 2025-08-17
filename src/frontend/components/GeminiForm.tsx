import { useState } from "react";
import styles from "./GeminiForm.module.css";

type GeminiFormProps = {
  onApiKeySubmitted: () => void;
};

export default function GeminiForm({ onApiKeySubmitted }: GeminiFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.target as HTMLFormElement);
    const key = formData.get("apikey-input") as string;

    try {
      const isValid = window.textmc.validateLLMKey(key);

      if (isValid) {
        // Save the API key
        window.textmc.setSecret("gemini-api-key", key);
        onApiKeySubmitted();
      } else {
        setError("Invalid API key. Please check your key and try again.");
      }
    } catch (_) {
      setError("Error validating API key. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
    >
      <div className={styles.apiKeyNotice}>
        The Minecraft bot is powered by Google's Gemini API, so you need to
        provide a Gemini API key below that will be used for the bot's AI
        features. You can get one for free (with a solid free tier) using{" "}
        <a href='https://aistudio.google.com/'>Google AI Studio</a>. When
        submitted, the key is validated, encrypted, and stored on your machine
        to keep it safe. So, ensure you have taken note of it before submitting.
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <label
        htmlFor='apikey-input'
        className={styles.label}
      >
        Gemini API Key:
      </label>
      <input
        className={styles.input}
        required
        type='text'
        name='apikey-input'
        placeholder='Paste Gemini API Key Here'
        spellCheck={false}
        disabled={isSubmitting}
      />

      <button
        className={styles.button}
        type='submit'
        disabled={isSubmitting}
      >
        {isSubmitting ? "Validating..." : "Submit"}
      </button>
    </form>
  );
}
