import { useRef, useState } from "react";
import "./ConnectForm.css";

export default function ConnectForm() {
  const botRef = useRef(null);

  const [waiting, setWaiting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [host, setHost] = useState<string>();
  const [port, setPort] = useState<number>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (connected && botRef.current) {
      botRef.current.disconnect();
      botRef.current = null;
      setConnected(false);
      return;
    }
    if (!host || !port) return;

    setWaiting(true);
    try {
      const player = await window.textmc.createPlayer(host, port, "TextMCBot");

      player.once("end", () => {
        botRef.current = null;
        setConnected(false);
      });

      const bot = window.textmc.createBot(player);
      botRef.current = bot;
    } catch {
      botRef.current = null;
      setWaiting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connect Bot</h2>
      <label htmlFor='host-input'>host: </label>
      <input
        placeholder='host'
        type='password'
        name='host-input'
        id='host-input'
        value={host}
        onChange={event => setHost(event.target.value)}
      />

      <label htmlFor='port-input'>port: </label>
      <input
        placeholder='port'
        type='number'
        name='port-input'
        id='port-input'
        value={port}
        onChange={event => setPort(parseInt(event.target.value))}
      />

      <button
        type='submit'
        className={`${connected ? "disconnect" : "connect"}-btn`}
        disabled={waiting}
      >
        {waiting ? "waiting..." : connected ? "disconnect" : "connect"}
      </button>
    </form>
  );
}
