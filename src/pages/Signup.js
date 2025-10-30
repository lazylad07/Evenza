// src/pages/Signup.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      navigate("/dashboard");
    } catch (e) {
      alert("Signup failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Sign up</h2>
        <input className="w-full p-2 border rounded mb-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full p-2 border rounded mb-4" value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="Password" type="password" />
        <button onClick={submit} className="w-full bg-green-600 text-white p-2 rounded">Create account</button>
        <p className="mt-3 text-sm">Have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
