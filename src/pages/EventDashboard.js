// src/pages/EventDashboard.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  // 🔄 Fetch existing events
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else setEvents(data || []);
  };

  // 🔁 Setup realtime + fallback auto-refresh
  useEffect(() => {
    fetchEvents();

    // Live updates from Supabase Realtime
    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          console.log("🔄 Realtime change detected:", payload);
          fetchEvents();
        }
      )
      .subscribe((status) => console.log("Realtime connection:", status));

    // Backup auto-refresh every 5s (for reliability)
    const interval = setInterval(fetchEvents, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // ➕ Create new event
  const handleCreateEvent = async () => {
    if (!eventName || !eventDate) return alert("Please fill all fields");

    const { data, error } = await supabase
      .from("events")
      .insert([{ name: eventName, date: eventDate, yes: 0, maybe: 0, no: 0 }])
      .select();

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to create event. Check console.");
    } else {
      alert("🎉 Event created successfully!");
      setEventName("");
      setEventDate("");
      fetchEvents(); // refresh
    }
  };

  // 📱 Share via WhatsApp (fixed for Safari + mobile)
  const shareWhatsApp = (event) => {
    const url = `${window.location.origin}/rsvp/${event.id}`;
    const message = `🎉 You're invited to "${event.name}"!\n📅 ${new Date(
      event.date
    ).toLocaleString()}\n\nTap below to RSVP 👇\n${url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h2>🎉 Create Event</h2>

      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="datetime-local"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <button
        onClick={handleCreateEvent}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Create
      </button>

      <h3 style={{ marginTop: "40px" }}>📅 Your Events</h3>
      {events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        events.map((ev) => (
          <div
            key={ev.id}
            style={{
              marginTop: "20px",
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <h4>{ev.name}</h4>
            <p>Date & Time: {new Date(ev.date).toLocaleString()}</p>
            <p>
              ✅ Yes: {ev.yes || 0} | 🤔 Maybe: {ev.maybe || 0} | ❌ No:{" "}
              {ev.no || 0}
            </p>
            <button
              onClick={() => shareWhatsApp(ev)}
              style={{
                background: "#25D366",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Share via WhatsApp
            </button>
          </div>
        ))
      )}
    </div>
  );
}
