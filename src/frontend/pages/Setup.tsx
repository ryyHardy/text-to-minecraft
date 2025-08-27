import GeminiForm from "../components/GeminiForm";
import Page from "../components/ui/Page";

export default function Setup() {
  return (
    <Page
      title='Welcome!'
      contentClassName='flex gap-10 pt-10 flex-col justify-center items-center'
    >
      <h2 className='text-xl font-bold text-text-2'>
        Enter your Gemini API key to get started.
      </h2>
      <section className='p-5 max-w-2xl rounded-xl border border-border-1 bg-bg-surface-1'>
        <GeminiForm />
      </section>
    </Page>
  );
}
