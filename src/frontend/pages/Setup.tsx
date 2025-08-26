import { useState } from "react";

import { useSetup } from "../contexts/SetupContext";
import GeminiForm from "../components/GeminiForm";

export default function Setup() {
  return (
    <main className='min-h-screen flex items-center justify-center p-6 bg-bg-surface-1'>
      <section className='w-full max-w-xl space-y-6'>
        <header className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold text-text-1'>Setup</h1>
          <p className='text-text-2'>
            Enter your Gemini API key to get started.
          </p>
        </header>

        <div className='p-5 rounded-xl border border-border-1 bg-bg-surface-2'>
          <GeminiForm />
        </div>
      </section>
    </main>
  );
}
