import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function RSVPPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  const handleRSVP = async (type) => {
    const newCount = (event[type] || 0) + 1;
    const { error } = await supabase
      .from("events")
      .update({ [type]: newCount })
      .eq("id", eventId);

    if (error) {
      alert("Failed to update RSVP");
    } else {
      setEvent({ ...event, [type]: newCount });
      alert("✅ Response recorded!");
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  if (!event) return <h2 style={{ textAlign: "center" }}>Event not found</h2>;

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>🎉 {event.name}</h2>
      <p>📅 {new Date(event.date).toLocaleString()}</p>

      <h3>Are you coming?</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={() => handleRSVP("yes")}
          style={{ background: "#28a745", color: "#fff", padding: "10px 20px" }}
        >
          Yes
        </button>
        <button
          onClick={() => handleRSVP("maybe")}
          style={{ background: "#ffc107", color: "#000", padding: "10px 20px" }}
        >
          Maybe
        </button>
        <button
          onClick={() => handleRSVP("no")}
          style={{ background: "#dc3545", color: "#fff", padding: "10px 20px" }}
        >
          No
        </button>
      </div>
    </div>
  );
}
