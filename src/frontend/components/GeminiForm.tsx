import { useState } from "react";
import Form from "./ui/Form";
import Input from "./ui/Input";
import Button from "./ui/Button";
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
    <Form
      onSubmit={handleSubmit}
      error={error}
    >
      <div className='text-text-2 leading-relaxed'>
        The Minecraft bot is powered by Google's Gemini API, so you need to
        provide a Gemini API key below that will be used for the bot's AI
        features. You can get one for free (with a solid free tier) using{" "}
        <a
          href='https://aistudio.google.com/'
          className='text-text-link underline-offset-2 hover:text-accent-2 underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          Google AI Studio
        </a>
        . When submitted, the key is validated, encrypted, and stored on your
        machine to keep it safe. So, ensure you have taken note of it before
        submitting.
      </div>

      <Input
        label='Gemini API Key'
        name='apikey-input'
        type='password'
        placeholder='Paste Gemini API Key Here'
        spellCheck={false}
        disabled={isSubmitting}
        required
        revealToggle
      />

      <Button
        type='submit'
        className='w-full'
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {isSubmitting ? "Validating..." : "Submit"}
      </Button>
    </Form>
  );
}
