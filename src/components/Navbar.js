import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      className="fixed top-0 w-full bg-white/50 backdrop-blur-md flex justify-between items-center p-4 shadow-md z-50"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <Link to="/" className="font-semibold text-lg">🌸 Evenza</Link>
      {user ? (
        <button
          onClick={signOut}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600"
        >
          <LogOut size={16} /> Logout
        </button>
      ) : (
        <div className="flex gap-3">
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
        </div>
      )}
    </motion.nav>
  );
}
