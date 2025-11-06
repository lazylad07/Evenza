import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

export default function RSVPPage() {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    setLoading(true);
    let { data, error } = await supabase.from("events").select("*").eq("id", slugOrId).maybeSingle();
    if (!data) {
      const res = await supabase.from("events").select("*").eq("slug", slugOrId).maybeSingle();
      data = res.data;
    }
    setEvent(data || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [slugOrId]);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!event) return <div className="min-h-screen grid place-items-center">Event not found</div>;

  const localKey = `rsvp_${event.id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return alert("Select your RSVP");

    if (localStorage.getItem(localKey)) return alert("You already RSVP'd for this event.");

    const { error } = await supabase.from("rsvps").insert([
      {
        event_id: event.id,
        name: name || null,
        guest_count: Number(guestCount) || 1,
        status,
        notes: notes || null,
      },
    ]);

    if (error) {
      console.error("RSVP insert error:", error);
      return alert("Failed to save RSVP: " + error.message);
    }

    localStorage.setItem(localKey, "true");
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <h2 className="text-2xl font-semibold mb-2">Thanks — response recorded ✅</h2>
          <p className="text-sm text-gray-600 mb-4">
            See you at {event.name} on {dayjs(event.date).format("MMM D, YYYY h:mm A")}
          </p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Back to Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#f3e8ff,#eef2ff)" }}>
      <div className="bg-white rounded-2xl shadow p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
        <p className="text-sm text-gray-600 mb-3">{dayjs(event.date).format("ddd, MMM D, YYYY h:mm A")}</p>
        {event.venue && <p className="text-sm text-gray-600 mb-3">📍 {event.venue}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full p-2 border rounded"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min="1"
            className="w-full p-2 border rounded"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={() => setStatus("Yes")}
              className={`flex-1 py-2 rounded ${status === "Yes" ? "bg-green-100 border-green-500" : "bg-gray-100"}`}
            >
              ✅ Yes
            </button>
            <button
              type="button"
              onClick={() => setStatus("Maybe")}
              className={`flex-1 py-2 rounded ${status === "Maybe" ? "bg-yellow-100 border-yellow-500" : "bg-gray-100"}`}
            >
              🤔 Maybe
            </button>
            <button
              type="button"
              onClick={() => setStatus("No")}
              className={`flex-1 py-2 rounded ${status === "No" ? "bg-red-100 border-red-500" : "bg-gray-100"}`}
            >
              ❌ No
            </button>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded">
            Submit RSVP
          </button>
        </form>
      </div>
    </div>
  );
}
