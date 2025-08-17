export default function GeminiForm() {
  return (
    <form>
      <div className='apikey-notice'>
        The Minecraft bot is powered by Google's Gemini API, so you need to
        provide a Gemini API key below that will be used for the bot's AI
        features. You can get one for free (with a solid free tier) using
        <a href='https://aistudio.google.com/'>Google AI Studio</a>. When
        submitted, the key is validated, encrypted, and stored on your machine
        to keep it safe. So, ensure you have taken note of it before submitting.
      </div>
      <label htmlFor='apikey-input'>Gemini API Key:</label>
      <input
        required
        type='text'
        name='apikey-input'
        placeholder='Paste Gemini API Key Here'
        spellCheck={false}
      />

      <button type='submit'>submit</button>
    </form>
  );
}
