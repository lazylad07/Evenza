// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Evenza (demo)</h1>
        <p className="mb-6">Create events and share via WhatsApp. Guests RSVP without signing in.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/login" className="px-4 py-2 border rounded">Login</Link>
          <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
