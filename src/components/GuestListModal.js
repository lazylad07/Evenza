import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { motion } from "framer-motion";

function GuestModal({ eventId, onClose }) {
  const [guestName, setGuestName] = useState("");
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "guests"), where("eventId", "==", eventId));
    const unsub = onSnapshot(q, (snapshot) => {
      setGuests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [eventId]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestName) return;
    await addDoc(collection(db, "guests"), {
      eventId,
      name: guestName,
      rsvp: "Pending",
    });
    setGuestName("");
  };

  const handleRSVP = async (id, status) => {
    await deleteDoc(doc(db, "guests", id));
    await addDoc(collection(db, "guests"), {
      eventId,
      name: guests.find((g) => g.id === id)?.name || "",
      rsvp: status,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Manage Guests</h2>
        <form onSubmit={handleAddGuest} className="flex mb-4">
          <input
            type="text"
            placeholder="Guest Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="border p-2 flex-1 rounded-l"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 rounded-r"
          >
            Add
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {guests.map((g) => (
            <div
              key={g.id}
              className="flex justify-between bg-gray-100 p-2 rounded"
            >
              <span>{g.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleRSVP(g.id, "Yes")}
                  className="text-green-600"
                >
                  ✅
                </button>
                <button
                  onClick={() => handleRSVP(g.id, "No")}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

export default GuestModal;
