import { useState } from "react";

import { useSetup } from "../contexts/SetupContext";

type GeminiFormProps = {
  /** Optional callback for when the form is submitted successfully */
  onValidSubmit?: () => void;
  /** Whether this is for initial setup (true) or settings update (false) */
  isSetup?: boolean;
};

export default function GeminiForm({
  onValidSubmit,
  isSetup = true,
}: GeminiFormProps) {
  const { markSetupComplete } = useSetup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.target as HTMLFormElement);
    const key = formData.get("apikey-input") as string;

    try {
      const isValid = await window.textmc.validateLLMKey(key);

      if (isValid) {
        // Save the API key
        window.textmc.setSecret("gemini-api-key", key);

        if (isSetup) {
          markSetupComplete();
        } else {
          onValidSubmit?.();
        }
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
      className='form-container'
    >
      <div className='info-text'>
        The Minecraft bot is powered by Google's Gemini API, so you need to
        provide a Gemini API key below that will be used for the bot's AI
        features. You can get one for free (with a solid free tier) using{" "}
        <a href='https://aistudio.google.com/'>Google AI Studio</a>. When
        submitted, the key is validated, encrypted, and stored on your machine
        to keep it safe. So, ensure you have taken note of it before submitting.
      </div>

      {error && <div className='error-message'>{error}</div>}

      <div className='space-y-4'>
        <div>
          <label
            htmlFor='apikey-input'
            className='block text-sm font-medium uppercase tracking-wide'
          >
            Gemini API Key
          </label>
          <input
            className='input-field mt-1'
            required
            type='password'
            name='apikey-input'
            placeholder='Paste Gemini API Key Here'
            spellCheck={false}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button
        type='submit'
        className='btn-primary w-full'
        disabled={isSubmitting}
      >
        {isSubmitting ? "Validating..." : "Submit"}
      </button>
    </form>
  );
}
