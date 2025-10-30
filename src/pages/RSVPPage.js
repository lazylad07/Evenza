// src/pages/RSVPPage.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function RSVPPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) console.error("Error fetching event:", error);
      else setEvent(data);
      setLoading(false);
    }

    fetchEvent();
  }, [eventId]);

  async function handleRSVP(status) {
    const name = prompt("Enter your name to RSVP:");
    if (!name) return;

    const { error } = await supabase
      .from("rsvps")
      .insert([{ event_id: eventId, name, status }]);

    if (error) {
      console.error("RSVP failed:", error);
      alert("Something went wrong! Try again.");
    } else {
      setSubmitted(true);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700 text-lg">
        Loading event details...
      </div>
    );

  if (!event)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
        Event not found ❌
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center text-white"
      >
        <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
          🎉 {event.name}
        </h1>
        <p className="text-pink-100 mb-6">
          📅 {dayjs(event.date).format("DD/MM/YYYY, h:mm A")}
        </p>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-green-300 font-semibold text-lg"
          >
            ✅ RSVP Submitted — thank you!
          </motion.div>
        ) : (
          <>
            <p className="text-lg mb-4 font-medium">
              Are you coming?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleRSVP("Yes")}
                className="bg-green-400/80 hover:bg-green-500/90 text-white font-semibold px-6 py-2 rounded-full transition-all shadow-md"
              >
                ✅ Yes
              </button>
              <button
                onClick={() => handleRSVP("Maybe")}
                className="bg-yellow-400/80 hover:bg-yellow-500/90 text-white font-semibold px-6 py-2 rounded-full transition-all shadow-md"
              >
                🤔 Maybe
              </button>
              <button
                onClick={() => handleRSVP("No")}
                className="bg-red-500/80 hover:bg-red-600/90 text-white font-semibold px-6 py-2 rounded-full transition-all shadow-md"
              >
                ❌ No
              </button>
            </div>
          </>
        )}
      </motion.div>

      <footer className="mt-10 text-white/80 text-sm">
        ✨ Powered by Evenza
      </footer>
    </div>
  );
}
