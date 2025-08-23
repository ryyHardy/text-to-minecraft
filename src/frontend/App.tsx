import { Routes, Route, HashRouter } from "react-router";

import styles from "./App.module.css";

import { SetupProvider, useSetup } from "./contexts/SetupContext";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function AppContent() {
  const { isSetupComplete } = useSetup();

  if (isSetupComplete === null) {
    return <h1>Loading...</h1>;
  }

  return isSetupComplete ? (
    <HashRouter>
      <Routes>
        <Route
          index
          element={<Dashboard />}
        />
        <Route
          path='settings'
          element={<Settings />}
        />
      </Routes>
    </HashRouter>
  ) : (
    <Setup />
  );
}

export default function App() {
  return (
    <SetupProvider>
      <AppContent />
    </SetupProvider>
  );
}
