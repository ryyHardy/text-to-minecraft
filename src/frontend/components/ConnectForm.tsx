import { useEffect, useState } from "react";
import Form from "./ui/Form";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function ConnectForm() {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    host: "localhost",
    port: "25565",
    username: "TextMCBot",
  });

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
    <Form
      title='Connect Bot'
      error={error}
      onSubmit={handleSubmit}
      className='p-5 w-xl'
    >
      <Input
        label='Bot Username'
        name='username-input'
        value={formData.username}
        onChange={e =>
          setFormData(prev => ({ ...prev, username: e.target.value }))
        }
        placeholder='username'
        spellCheck={false}
        required
      />

      <Input
        label='Hostname'
        name='host-input'
        value={formData.host}
        onChange={e => setFormData(prev => ({ ...prev, host: e.target.value }))}
        placeholder='hostname'
        disabled={status === "connecting"}
        required
      />

      <Input
        label='Port'
        name='port-input'
        type='number'
        min={1}
        max={65535}
        value={formData.port}
        onChange={e => setFormData(prev => ({ ...prev, port: e.target.value }))}
        placeholder='port'
        helperText='Port must be between 1 and 65535'
        disabled={status === "connecting"}
        required
      />

      <Button
        type='submit'
        className='w-full'
        disabled={status === "connecting"}
        loading={status === "connecting"}
      >
        {status === "connected" ? "Disconnect" : "Connect"}
      </Button>
    </Form>
  );
}
