import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import EventDashboard from "./pages/EventDashboard";
import RSVPPage from "./pages/RSVPPage";
import ViewGuests from "./components/ViewGuests";
import PrivateRoute from "./components/PrivateRoute";
import PosterTrial from "./pages/PosterTrial";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <EventDashboard />
              </PrivateRoute>
            }
          />
          <Route
  path="/postertrial"
  element={
    <PosterTrial
      eventName="Gwalan’s Birthday Bash 🎉"
      date="June 25, 2025"
      tagline="A Night to Remember!"
    />
  }
/>


          <Route path="/rsvp/:slugOrId" element={<RSVPPage />} />
          <Route path="/view-guests/:eventId" element={<ViewGuests />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
