// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    // clear local user (AuthContext should pick this up via onAuthStateChange too)
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-purple-600">
        Evenza
      </Link>

      <div className="flex gap-4 items-center">
        {!user ? (
          <>
            <Link to="/login" className="text-purple-600 hover:underline font-medium">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-purple-600 hover:underline font-medium">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
