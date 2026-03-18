import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import EventDashboard from "./pages/EventDashboard";
import RSVPPage from "./pages/RSVPPage";
import ViewGuests from "./components/ViewGuests";
import PrivateRoute from "./components/PrivateRoute";
import PosterGeneratorTrial from "./components/PosterGeneratorTrial";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🧠 Poster Generator Trial Route */}
          <Route path="/poster-generator" element={<PosterGeneratorTrial />} />

          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <EventDashboard />
              </PrivateRoute>
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
