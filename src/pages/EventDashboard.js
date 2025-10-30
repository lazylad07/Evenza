import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function EventDashboard() {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  // 🧠 Fetch Events
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setEvents(data || []);
    else console.error("Fetch error:", error);
  };

  useEffect(() => {
    fetchEvents();

    // Real-time updates for both tables
    const eventChannel = supabase
      .channel("events-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchEvents)
      .subscribe();

    const rsvpChannel = supabase
      .channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(rsvpChannel);
    };
  }, []);

  // ➕ Create New Event
  const handleCreateEvent = async () => {
    if (!eventName || !eventDate) return alert("Please fill all fields");
    const { error } = await supabase
      .from("events")
      .insert([{ name: eventName, date: new Date(eventDate).toISOString() }]);
    if (error) {
      console.error("Insert error:", error);
      alert("Failed to create event.");
    } else {
      setEventName("");
      setEventDate("");
      fetchEvents();
    }
  };

  // 🗑 Delete Event (with cascade RSVPs)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete event. Check Supabase FK constraints.");
    } else {
      fetchEvents();
    }
  };

  // ✏️ Save Edited Event
  const handleEditSave = async () => {
    if (!editingEvent.name || !editingEvent.date) return;
    const { error } = await supabase
      .from("events")
      .update({
        name: editingEvent.name,
        date: new Date(editingEvent.date).toISOString(),
      })
      .eq("id", editingEvent.id);
    if (error) console.error("Update error:", error);
    else {
      setEditingEvent(null);
      fetchEvents();
    }
  };

  // 💬 Share via WhatsApp
  const shareWhatsApp = (event) => {
    const baseUrl =
      window.location.hostname === "localhost"
        ? "https://evenza-n78t.vercel.app"
        : window.location.origin;
    const url = `${baseUrl}/rsvp/${event.id}`;

    const message = `🎉 You're invited to *${event.name}*!\n📅 ${new Date(
      event.date
    ).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}\n\nTap to RSVP 👇\n${url}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* 🔹 Navbar */}
      <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">✨ Evenza Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm opacity-90">
            Welcome, <span className="font-medium">{user?.email}</span>
          </p>
          <button
            onClick={signOut}
            className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 🔹 Main Section */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Create Event */}
        <motion.div
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">🎉 Create a New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="p-3 border rounded-md focus:ring-2 focus:ring-pink-300"
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="p-3 border rounded-md focus:ring-2 focus:ring-pink-300"
            />
            <button
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-md px-5 py-3 hover:opacity-90 transition"
            >
              Create Event
            </button>
          </div>
        </motion.div>

        {/* List of Events */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">📅 Your Events</h3>
        {events.length === 0 ? (
          <p className="text-gray-500">No events yet. Start by creating one!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-5 hover:shadow-xl transition relative"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{ev.name}</h4>
                <p className="text-gray-600 mb-2">
                  📅{" "}
                  {new Date(ev.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ✅ Yes: {ev.yes || 0} | 🤔 Maybe: {ev.maybe || 0} | ❌ No: {ev.no || 0}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => shareWhatsApp(ev)}
                    className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="bg-yellow-400 text-white px-3 py-2 rounded-md hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ✏️ Edit Modal */}
      <AnimatePresence>
        {editingEvent && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-4">✏️ Edit Event</h3>
              <input
                type="text"
                value={editingEvent.name}
                onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                className="w-full p-3 border rounded-md mb-3"
              />
              <input
                type="datetime-local"
                value={editingEvent.date.slice(0, 16)}
                onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                className="w-full p-3 border rounded-md mb-5"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
