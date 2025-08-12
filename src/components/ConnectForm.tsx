import { useEffect, useState } from "react";
import "./ConnectForm.css";

export default function ConnectForm() {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [host, setHost] = useState<string>("localhost");
  const [port, setPort] = useState<number>(25565);
  const [username, setUsername] = useState<string>("TextMCBot");

  useEffect(() => {
    // Listen for disconnection events
    window.textmc.onBotDisconnected((_, reason) => {
      setStatus("disconnected");
      setError(`Bot disconnected: ${reason}`);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (status === "connected") {
      const result = await window.textmc.disconnectBot(username);
      if (result.success) {
        setStatus("disconnected");
      } else {
        setError(result.error ?? null);
      }
      return;
    }

    if (!host || !port) return;

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
      key={status} // Forces a re-render every time the bot connects/disconnects
    >
      <h2>Connect Bot</h2>

      {error && <div className='error'>{error}</div>}

      <label htmlFor='username-input'>bot username</label>
      <input
        required
        placeholder='username'
        type='text'
        name='username-input'
        value={username}
        onChange={e => setUsername(e.target.value)}
        spellCheck={false}
      />

      <label htmlFor='host-input'>hostname</label>
      <input
        required
        placeholder='hostname'
        type='text'
        name='host-input'
        value={host}
        disabled={status === "connecting"}
        onChange={e => setHost(e.target.value)}
      />

      <label htmlFor='port-input'>port</label>
      <input
        required
        placeholder='port'
        type='number'
        name='port-input'
        value={port}
        disabled={status === "connecting"}
        onChange={e =>
          setPort(e.target.value ? parseInt(e.target.value) : undefined)
        }
      />

      <button
        type='submit'
        className={`${status === "disconnected" ? "connect" : "disconnect"}-btn`}
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
