import { useState } from "react";
import "./ConnectForm.css";

export default function ConnectForm() {
  const [waiting, setWaiting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [host, setHost] = useState<string>();
  const [port, setPort] = useState<number>();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setConnected(prev => !prev);
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
