import { Routes, Route, HashRouter } from "react-router";

import styles from "./App.module.css";

import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path='/setup'
          element={<Setup />}
        />
        <Route
          path='/'
          element={<Dashboard />}
        />
        <Route
          path='/settings'
          element={<Settings />}
        />
      </Routes>
    </HashRouter>
  );
}
