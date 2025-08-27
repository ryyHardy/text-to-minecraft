import { Routes, Route, HashRouter } from "react-router";

import { SetupProvider, useSetup } from "./contexts/SetupContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function AppContent() {
  const { isSetupComplete } = useSetup();

  if (isSetupComplete === null) {
    return <h1>Loading...</h1>;
  }

  return (
    <HashRouter>
      <Routes>
        {isSetupComplete ? (
          <>
            <Route
              index
              element={<Dashboard />}
            />
            <Route
              path='settings'
              element={<Settings />}
            />
          </>
        ) : (
          <Route
            index
            element={<Setup />}
          />
        )}
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SetupProvider>
        <AppContent />
      </SetupProvider>
    </ThemeProvider>
  );
}
