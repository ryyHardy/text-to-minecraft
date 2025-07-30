import "./App.css";

import ConnectForm from "./components/ConnectForm";

export default function App() {
  window.textmc.testPreload();
  return <ConnectForm />;
}
