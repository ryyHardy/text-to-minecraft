import { useEffect, useState } from "react";

export default function ConnectForm() {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for disconnection events
    window.textmc.onBotDisconnected((_, reason) => {
      setStatus("disconnected");
      setError(`Bot disconnected: ${reason}`);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const host = formData.get("host-input") as string;
    const port = parseInt(formData.get("port-input") as string);
    const username = formData.get("username-input") as string;

    setError(null);

    if (!host || !port || !username) {
      setError("All fields are required");
      return;
    }

    if (port < 1 || port > 65535) {
      setError("Port must be between 1 and 65535");
      return;
    }

    if (status === "connected") {
      const result = await window.textmc.disconnectBot(username);
      if (result.success) {
        setStatus("disconnected");
      } else {
        setError(result.error ?? null);
      }
      return;
    }

    setStatus("connecting");
    try {
      const result = await window.textmc.connectBot(host, port, username);
      if (result.success) {
        setStatus("connected");
      } else {
        setError(result.error);
        setStatus("disconnected");
      }
    } catch (err) {
      setError(err.message);
      setStatus("disconnected");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='form-container p-5'
      key={status} // Prevent user from entering things while connecting
    >
      <h2 className='text-2xl font-bold text-center'>Connect Bot</h2>

      {error && <div className='error-message'>{error}</div>}

      <div className='space-y-4'>
        <div>
          <label
            htmlFor='username-input'
            className='block text-sm font-medium uppercase tracking-wide'
          >
            Bot Username
          </label>
          <input
            className='input-field mt-1'
            required
            placeholder='username'
            type='text'
            name='username-input'
            defaultValue='TextMCBot'
            spellCheck={false}
          />
        </div>

        <div>
          <label
            htmlFor='host-input'
            className='block text-sm font-medium uppercase tracking-wide'
          >
            Hostname
          </label>
          <input
            className='input-field mt-1'
            required
            placeholder='hostname'
            type='text'
            name='host-input'
            defaultValue='localhost'
            disabled={status === "connecting"}
          />
        </div>

        <div>
          <label
            htmlFor='port-input'
            className='block text-sm font-medium uppercase tracking-wide'
          >
            Port
          </label>
          <input
            className='input-field mt-1'
            required
            placeholder='port'
            type='number'
            name='port-input'
            defaultValue='25565'
            disabled={status === "connecting"}
          />
        </div>
      </div>

      <button
        type='submit'
        className={`w-full ${status === "connected" ? "btn-secondary" : "btn-primary"}`}
        disabled={status === "connecting"}
      >
        {status === "connecting"
          ? "Connecting..."
          : status === "connected"
            ? "Disconnect"
            : "Connect"}
      </button>
    </form>
  );
}
