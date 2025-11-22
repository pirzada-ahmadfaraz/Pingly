import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
import Verify from "./components/Verify";
import Dashboard from "./components/Dashboard";
import GoogleCallback from "./components/GoogleCallback";
import CreateHttpMonitor from "./components/CreateHttpMonitor";
import CreatePingMonitor from "./components/CreatePingMonitor";
import MonitorDetail from "./components/MonitorDetail";
import Incidents from "./components/Incidents";
import StatusPages from "./components/StatusPages";
import CreateStatusPage from "./components/CreateStatusPage";
import StatusPageDetail from "./components/StatusPageDetail";
import PublicStatusPage from "./components/PublicStatusPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/incidents" element={<Incidents />} />
          <Route path="/dashboard/status-pages" element={<StatusPages />} />
          <Route path="/dashboard/status-pages/create" element={<CreateStatusPage />} />
          <Route path="/dashboard/status-pages/:id" element={<StatusPageDetail />} />
          <Route path="/dashboard/monitors/new-monitor/http" element={<CreateHttpMonitor />} />
          <Route path="/dashboard/monitors/new-monitor/ping" element={<CreatePingMonitor />} />
          <Route path="/dashboard/monitors/:id" element={<MonitorDetail />} />
          <Route path="/status/:id" element={<PublicStatusPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
