export default function OpenAIForm() {
  return (
    <form>
      <div className='apikey-notice'>
        The Minecraft bot is powered by OpenAI's API, so you need to provide an
        OpenAI API key below that will be used by the bot. When submitted, the
        key is validated, encrypted, and stored on your machine to keep it safe.
        It will not be saved anywhere else, so ensure you have taken note of it.
      </div>
      <label htmlFor='apikey-input'>OpenAI API Key:</label>
      <input
        required
        type='text'
        name='apikey-input'
        placeholder='Paste OpenAI API Key Here'
        spellCheck={false}
      />

      <button type='submit'>submit</button>
    </form>
  );
}
