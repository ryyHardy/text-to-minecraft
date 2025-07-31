import { useEffect, useState } from "react";
import "./ConnectForm.css";

export default function ConnectForm() {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [host, setHost] = useState<string>("");
  const [port, setPort] = useState<number>(25565);
  const [username, setUsername] = useState<string>("TextMCBot");

  useEffect(() => {
    // Listen for disconnection events
    const cleanup = window.textmc.onBotDisconnected((_, reason) => {
      setStatus("disconnected");
      setError(`Bot disconnected: ${reason}`);
    });

    return cleanup;
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (status === "connected") {
      try {
        await window.textmc.disconnectBot(username);
        setStatus("disconnected");
      } catch (err) {
        setError(err.message);
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
    <form onSubmit={handleSubmit}>
      <h2>Connect Bot</h2>

      {error && <div className='error'>{error}</div>}

      <label htmlFor='host-input'>Host: </label>
      <input
        required
        placeholder='hostname'
        type='text'
        id='host-input'
        value={host}
        disabled={status === "connecting"}
        onChange={e => setHost(e.target.value)}
      />

      <label htmlFor='port-input'>Port: </label>
      <input
        required
        placeholder='25565'
        type='number'
        id='port-input'
        value={port}
        disabled={status === "connecting"}
        onChange={e => setPort(parseInt(e.target.value))}
      />

      <button
        type='submit'
        className={`${status === "connected" ? "disconnect" : "connect"}-btn`}
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
