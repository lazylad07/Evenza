import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ViewGuests() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      setEvent(eventData);

      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId);
      setGuests(rsvpData || []);
    };
    fetchData();
  }, [eventId]);

  const sortedGuests = [...guests].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100 flex flex-col items-center py-8 px-3 sm:px-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-5xl p-6 sm:p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-700">
            🎊 {event ? event.name : "Event"} — Guests
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            ← Back
          </button>
        </div>

        <p className="text-center text-gray-600 mb-6 sm:mb-8">
          📍 {event?.venue || "Venue TBD"}
        </p>

        {sortedGuests.length === 0 ? (
          <p className="text-center text-gray-500">No guests have RSVP'd yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-purple-200">
            <table className="w-full text-sm sm:text-base text-gray-700">
              <thead>
                <tr className="bg-purple-100 text-purple-800 text-left">
                  <th className="p-3 sm:p-4 rounded-l-lg">Name</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4">Guests</th>
                  <th className="p-3 sm:p-4 rounded-r-lg">Responded</th>
                </tr>
              </thead>
              <tbody>
                {sortedGuests.map((g) => (
                  <tr
                    key={g.id}
                    className="bg-white even:bg-purple-50 hover:bg-purple-100 transition"
                  >
                    <td className="p-3 sm:p-4 font-medium">{g.name}</td>
                    <td
                      className={`p-3 sm:p-4 font-semibold ${
                        g.status === "yes"
                          ? "text-green-600"
                          : g.status === "maybe"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {g.status}
                    </td>
                    <td className="p-3 sm:p-4">{g.guest_count || 1}</td>
                    <td className="p-3 sm:p-4 text-gray-500 text-sm">
                      {new Date(g.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
