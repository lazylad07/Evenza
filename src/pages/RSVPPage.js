// src/pages/RSVPPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { motion } from "framer-motion";

export default function RSVPPage() {
  const { slugOrId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [customAnswers, setCustomAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let { data } = await supabase.from("events").select("*").eq("id", slugOrId).maybeSingle();
      if (!data) {
        const res = await supabase.from("events").select("*").eq("slug", slugOrId).maybeSingle();
        data = res.data;
      }
      if (!data) {
        setEvent(null);
        setLoading(false);
        return;
      }
      setEvent(data);

      // sub_events load
      const { data: subs } = await supabase
        .from("sub_events")
        .select("*")
        .eq("event_id", data.id)
        .order("date_time", { ascending: true });
      setSubEvents(subs || []);

      // init custom answers if any
      if (Array.isArray(data.custom_questions)) {
        const initial = {};
        data.custom_questions.forEach((q) => (initial[q] = ""));
        setCustomAnswers(initial);
      } else {
        setCustomAnswers({});
      }

      setLoading(false);
    };

    fetch();
  }, [slugOrId]);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!event) return <div className="min-h-screen grid place-items-center">Event not found</div>;

  const localKey = `rsvp_${event.id}`;

  const buildNotes = () => {
    const answers = Object.entries(customAnswers)
      .map(([q, a]) => `${q}: ${a}`)
      .join(" | ");
    const extras = [`Notes:${notes || ""}`, `Guests:${guestCount}`];
    return [answers, extras.join(" | ")].filter(Boolean).join(" | ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return alert("Select your RSVP");
    if (localStorage.getItem(localKey)) return alert("You already RSVP'd for this event.");

    const { error } = await supabase.from("rsvps").insert([{
      event_id: event.id,
      name: name || null,
      guest_count: Number(guestCount) || 1,
      status,
      notes: buildNotes() || null,
    }]);

    if (error) {
      console.error("RSVP insert error:", error);
      return alert("Failed to save RSVP: " + error.message);
    }

    localStorage.setItem(localKey, "true");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-4">
        <motion.div 
          className="bg-white rounded-2xl p-8 text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-semibold mb-2">Thanks — response recorded ✅</h2>
          <p className="text-sm text-gray-600 mb-4">See you at {event.name} on {dayjs(event.date).format("MMM D, YYYY h:mm A")}</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#f3e8ff,#eef2ff)" }}>
       {/* BRANDING */}
    <div className="absolute top-4 w-full text-center text-sm text-gray-500">
      Evenza by <span className="font-semibold">Gwalan Barai</span>
    </div>
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Event Header */}
        <h1 className="text-3xl font-bold mb-2 text-purple-700">{event.name}</h1>
        <p className="text-sm text-gray-500 mb-1">{dayjs(event.date).format("ddd, MMM D, YYYY h:mm A")}</p>
        {event.venue && <p className="text-sm text-gray-500 mb-4">📍 {event.venue}</p>}

        {/* Dress Code */}
        {event.dress_code ? (
          <div className="bg-purple-100 border border-purple-300 text-purple-800 font-semibold rounded-xl py-3 px-4 mb-4 shadow-sm">
            👗 <span className="italic">Dress Code:</span> <span className="font-bold"> {event.dress_code}</span>
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-400 italic py-2 mb-4 rounded-lg text-center">
            No dress code mentioned
          </div>
        )}

        {/* Sub-events */}
        {subEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Event Schedule</h3>
            <div className="space-y-3">
              {subEvents.map((s) => (
                <motion.div key={s.id} className="bg-indigo-50 rounded-xl p-3 shadow-sm flex flex-col" whileHover={{ scale: 1.02 }}>
                  <div className="font-medium text-purple-700">{s.title}</div>
                  <div className="text-xs text-gray-600">
                    {s.date_time ? dayjs(s.date_time).format("ddd, MMM D, YYYY h:mm A") : "TBD"} 
                    {s.venue ? ` • ${s.venue}` : ""}
                  </div>
                  {s.dress_code && <div className="text-xs text-purple-600 mt-1">👗 {s.dress_code}</div>}
                  <div className="mt-2 flex gap-2">
                    <AddToCalendarButton
                      name={`${event.name} — ${s.title}`}
                      startDate={s.date_time ? dayjs(s.date_time).format("YYYY-MM-DD") : dayjs(event.date).format("YYYY-MM-DD")}
                      startTime={s.date_time ? dayjs(s.date_time).format("HH:mm") : dayjs(event.date).format("HH:mm")}
                      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                      options={["Google", "Apple", "Outlook.com"]}
                      location={s.venue || event.venue || ""}
                      className="text-xs"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Your Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min="1"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />

          {/* Custom Questions */}
          {event.custom_questions && Array.isArray(event.custom_questions) && event.custom_questions.length > 0 && (
            <div className="space-y-2">
              {event.custom_questions.map((q, i) => (
                <div key={i}>
                  <label className="text-sm font-medium mb-1">{q}</label>
                  <input
                    value={customAnswers[q] || ""}
                    onChange={(e) => setCustomAnswers({ ...customAnswers, [q]: e.target.value })}
                    className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}
            </div>
          )}

          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* RSVP Buttons */}
          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={() => setStatus("Yes")}
              className={`flex-1 py-3 rounded-xl border text-white font-semibold transition ${status === "Yes" ? "bg-green-500" : "bg-gray-200"}`}
            >✅ Yes</button>
            <button
              type="button"
              onClick={() => setStatus("Maybe")}
              className={`flex-1 py-3 rounded-xl border text-white font-semibold transition ${status === "Maybe" ? "bg-yellow-400" : "bg-gray-200"}`}
            >🤔 Maybe</button>
            <button
              type="button"
              onClick={() => setStatus("No")}
              className={`flex-1 py-3 rounded-xl border text-white font-semibold transition ${status === "No" ? "bg-red-500" : "bg-gray-200"}`}
            >❌ No</button>
          </div>

          <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
            Submit RSVP
          </button>

          <button type="button" onClick={() => window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&dates=${dayjs(event.date).format("YYYYMMDDTHHmmss")}/${dayjs(event.date).add(2, "hour").format("YYYYMMDDTHHmmss")}`, "_blank")}
            className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Add to Google Calendar
          </button>
        </form>
      </motion.div>
    </div>
  );
}