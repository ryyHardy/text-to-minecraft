import { useEffect, useState } from "react";
import styles from "./ConnectForm.module.css";

type ConnectFormProps = {
  onNavigateToSettings: () => void;
};

export default function ConnectForm({ onNavigateToSettings }: ConnectFormProps) {
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
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        key={status} // Forces a re-render every time the bot connects/disconnects
      >
        <h2>Connect Bot</h2>

        {error && <div className={styles.error}>{error}</div>}

        <label
          className={styles.label}
          htmlFor='username-input'
        >
          bot username
        </label>
        <input
          className={styles.input}
          required
          placeholder='username'
          type='text'
          name='username-input'
          defaultValue='TextMCBot'
          spellCheck={false}
        />

        <label
          className={styles.label}
          htmlFor='host-input'
        >
          hostname
        </label>
        <input
          className={styles.input}
          required
          placeholder='hostname'
          type='text'
          name='host-input'
          defaultValue='localhost'
          disabled={status === "connecting"}
        />

        <label
          className={styles.label}
          htmlFor='port-input'
        >
          port
        </label>
        <input
          className={styles.input}
          required
          placeholder='port'
          type='number'
          name='port-input'
          defaultValue='25565'
          disabled={status === "connecting"}
        />

        <button
          type='submit'
          className={`${styles.button} ${status === "disconnected" ? styles.connectBtn : styles.disconnectBtn}`}
          disabled={status === "connecting"}
        >
          {status === "connecting"
            ? "Connecting..."
            : status === "connected"
              ? "Disconnect"
              : "Connect"}
        </button>
      </form>

      <button
        type="button"
        className={styles.settingsButton}
        onClick={onNavigateToSettings}
      >
        ⚙️ Settings
      </button>
    </div>
  );
}
