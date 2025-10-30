import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventDashboard from "./pages/EventDashboard";
import RSVPPage from "./pages/RSVPPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EventDashboard />} />
        <Route path="/rsvp/:eventId" element={<RSVPPage />} />
      </Routes>
    </Router>
  );
}
