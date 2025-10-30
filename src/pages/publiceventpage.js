// src/pages/PublicEventPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PublicEventPage() {
  const { id } = useParams(); // /event/:id
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "events", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setEvent({ notFound: true });
        } else {
          setEvent(snap.data());
        }
      } catch (err) {
        console.error(err);
        setEvent({ notFound: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRSVP = async (choice) => {
    if (!event || event.notFound) return;
    const ref = doc(db, "events", id);
    await updateDoc(ref, { [choice]: increment(1) });
    setPicked(choice);
    // refresh displayed counts
    const snap = await getDoc(ref);
    setEvent(snap.data());
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (event?.notFound) return <div className="h-screen flex items-center justify-center">Event not found</div>;

  let dateDisplay = "";
  if (event.date?.toDate) dateDisplay = event.date.toDate().toLocaleString();
  else if (event.date) dateDisplay = new Date(event.date).toLocaleString();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
        <p className="text-neutral-600 mb-4">📅 {dateDisplay}</p>

        {picked ? (
          <div className="text-green-600 font-semibold">Thanks — you selected: {picked}</div>
        ) : (
          <>
            <div className="flex gap-2 justify-center mb-4">
              <button onClick={() => handleRSVP("yes")} className="px-4 py-2 rounded bg-green-500 text-white">Yes</button>
              <button onClick={() => handleRSVP("maybe")} className="px-4 py-2 rounded bg-yellow-400 text-white">Maybe</button>
              <button onClick={() => handleRSVP("no")} className="px-4 py-2 rounded bg-red-500 text-white">No</button>
            </div>
            <div className="text-sm text-neutral-700">
              Current: Yes {event.yes} · Maybe {event.maybe} · No {event.no}
            </div>
          </>
        )}

        <p className="mt-4 text-xs text-neutral-500">Share this event: <a className="underline" target="_blank" rel="noreferrer"
          href={`https://wa.me/?text=${encodeURIComponent(`You're invited to "${event.name}" on ${dateDisplay}! RSVP here: https://evenza-77a26.web.app/event/${id}`)}`}>
          WhatsApp
        </a></p>
      </div>
    </div>
  );
}
