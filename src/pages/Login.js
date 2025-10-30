// src/pages/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      navigate("/dashboard");
    } catch (e) {
      alert("Login failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <input className="w-full p-2 border rounded mb-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full p-2 border rounded mb-4" value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="Password" type="password" />
        <button onClick={submit} className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        <p className="mt-3 text-sm">No account? <Link to="/signup" className="text-blue-600">Sign up</Link></p>
      </div>
    </div>
  );
}
