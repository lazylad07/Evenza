import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function RSVPPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return alert("Please select your response");

    const { error } = await supabase.from("rsvps").insert([
      { event_id: eventId, name, guest_count: guestCount, status },
    ]);

    if (!error) setSubmitted(true);
    else alert("Error saving RSVP");
  };

  if (submitted)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-100 to-pink-100 text-gray-800">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-semibold mb-3 text-purple-700">
            💜 Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            Your RSVP has been recorded successfully!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-purple-100">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">🎉 RSVP</h1>
        <p className="text-gray-500 mb-6">Let us know if you’re coming!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <div className="flex justify-around mt-6">
            {["Yes", "Maybe", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`p-3 rounded-xl w-24 font-medium transition border ${
                  status === option
                    ? option === "Yes"
                      ? "bg-green-100 border-green-400 text-green-700"
                      : option === "Maybe"
                      ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                      : "bg-red-100 border-red-400 text-red-700"
                    : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {option === "Yes" ? "✅ Yes" : option === "Maybe" ? "🤔 Maybe" : "❌ No"}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg mt-6 hover:bg-purple-700 transition font-semibold"
          >
            Submit RSVP
          </button>
        </form>
      </div>
    </div>
  );
}
