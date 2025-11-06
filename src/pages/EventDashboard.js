import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { QRCodeCanvas } from "qrcode.react";
import { AddToCalendarButton } from "add-to-calendar-button-react";

export default function EventDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch events
  const fetchEvents = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("events")
      .select("*, rsvps(id, name, status, guest_count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return console.error("Fetch error:", error);

    const mapped = (data || []).map((ev) => {
      const rsvps = ev.rsvps || [];
      const yes = rsvps.filter((r) => r.status === "Yes").length;
      const maybe = rsvps.filter((r) => r.status === "Maybe").length;
      const no = rsvps.filter((r) => r.status === "No").length;
      const totalGuests = rsvps.reduce((s, r) => s + (r.guest_count || 1), 0);
      return { ...ev, _counts: { yes, maybe, no, totalGuests } };
    });

    setEvents(mapped);
  };

  useEffect(() => {
    fetchEvents();

    // Real-time updates
    const eChan = supabase
      .channel("events-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchEvents)
      .subscribe();

    const rChan = supabase
      .channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(eChan);
      supabase.removeChannel(rChan);
    };
  }, [user?.id]);

  // Create event
  const handleCreateEvent = async () => {
    if (!eventName || !eventDate) return alert("Please fill all fields");

    const { error } = await supabase.from("events").insert([
      {
        name: eventName,
        date: new Date(eventDate).toISOString(),
        venue: eventVenue || null,
        user_id: user.id,
      },
    ]);

    if (error) return alert("Failed to create event: " + error.message);

    setEventName("");
    setEventDate("");
    setEventVenue("");
    fetchEvents();
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return alert("Failed to delete event: " + error.message);
    fetchEvents();
  };

  // Edit event
  const handleEditSave = async () => {
    if (!editingEvent?.name || !editingEvent?.date) return alert("Fill event fields");
    const { error } = await supabase
      .from("events")
      .update({
        name: editingEvent.name,
        date: new Date(editingEvent.date).toISOString(),
        venue: editingEvent.venue || null,
      })
      .eq("id", editingEvent.id);

    if (error) return alert("Failed to update event: " + error.message);
    setEditingEvent(null);
    fetchEvents();
  };

  // Share WhatsApp
  const shareWhatsApp = (ev) => {
    const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;
    const link = `${baseUrl}/rsvp/${ev.id}`;
    const text = `🎉 You're invited to *${ev.name}*!\n📅 ${dayjs(ev.date).format(
      "MMM D, YYYY h:mm A"
    )}\nRSVP: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Copy link
  const copyLink = (ev) => {
    const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;
    const link = `${baseUrl}/rsvp/${ev.id}`;
    navigator.clipboard.writeText(link).then(() => alert("Link copied!"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar logout={logout} email={user?.email} />
      <div className="max-w-6xl mx-auto p-6">
        {/* Create Event */}
        <motion.div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-700">🎉 Create a New Event</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="p-3 border rounded-md"
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="p-3 border rounded-md"
            />
            <input
              type="text"
              placeholder="Venue (optional)"
              value={eventVenue}
              onChange={(e) => setEventVenue(e.target.value)}
              className="p-3 border rounded-md"
            />
            <button
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-md px-5 py-3"
            >
              Create Event
            </button>
          </div>
        </motion.div>

        {/* Events List */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">📅 Your Events</h3>
        {events.length === 0 ? (
          <p className="text-gray-500">No events yet. Create one!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                className="bg-white/80 backdrop-blur-md rounded-xl p-5 shadow-md"
                whileHover={{ scale: 1.01 }}
              >
                <h4 className="text-lg font-semibold text-gray-800">{ev.name}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  📅 {dayjs(ev.date).format("MMM D, YYYY h:mm A")}
                </p>
                {ev.venue && <p className="text-sm text-gray-600 mb-2">📍 {ev.venue}</p>}
                <p className="text-sm text-gray-500 mb-3">
                  ✅ {ev._counts?.yes || 0} | 🤔 {ev._counts?.maybe || 0} | ❌ {ev._counts?.no || 0} | 👥{" "}
                  {ev._counts?.totalGuests || 0}
                </p>

                {/* Action Buttons + QR + Add-to-Calendar */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    onClick={() => shareWhatsApp(ev)}
                    className="bg-green-500 text-white px-3 py-2 rounded-md"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => copyLink(ev)}
                    className="bg-gray-600 text-white px-3 py-2 rounded-md"
                  >
                    Copy Link
                  </button>

                  <QRCodeCanvas
                    value={`${process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin}/rsvp/${ev.id}`}
                    size={80}
                    className="rounded border p-1"
                  />

                  <AddToCalendarButton
                    name={ev.name}
                    startDate={dayjs(ev.date).format("YYYY-MM-DD")}
                    startTime={dayjs(ev.date).format("HH:mm")}
                    timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                    options={["Google", "Apple", "Outlook.com"]}
                    location={ev.venue || ""}
                    className="rounded"
                  />

                  <button
                    onClick={() => navigate(`/view-guests/${ev.id}`)}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md"
                  >
                    View Guests
                  </button>

                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="bg-yellow-400 text-white px-3 py-2 rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">Edit Event</h3>
              <input
                className="w-full p-2 border rounded mb-2"
                value={editingEvent.name}
                onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded mb-2"
                type="datetime-local"
                value={dayjs(editingEvent.date).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded mb-4"
                value={editingEvent.venue || ""}
                onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingEvent(null)} className="px-3 py-2 bg-gray-300 rounded">
                  Cancel
                </button>
                <button onClick={handleEditSave} className="px-3 py-2 bg-indigo-600 text-white rounded">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
