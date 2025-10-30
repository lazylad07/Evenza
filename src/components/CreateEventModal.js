import React, { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateEventModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");

  const handleCreate = async () => {
    if (!title || !date) return alert("Title & Date required!");
    try {
      await addDoc(collection(db, "events"), {
        title,
        description: desc,
        date,
        createdAt: serverTimestamp(),
      });
      onClose(); // close modal after saving
      setTitle("");
      setDesc("");
      setDate("");
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-6 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-xl font-semibold mb-4">Create Event</h2>
        <input
          type="text"
          placeholder="Event Title"
          className="border p-2 rounded w-full mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border p-2 rounded w-full mb-2"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded w-full mb-4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}
