// src/components/ViewGuests.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import Navbar from "./Navbar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

export default function ViewGuests() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState("guests");

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: ev } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      setEvent(ev || null);

      const { data: list } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      setRsvps(list || []);
      setLoading(false);
    };

    fetchData();
  }, [eventId]);

  if (loading)
    return <div className="min-h-screen grid place-items-center">Loading...</div>;

  if (!event)
    return <div className="min-h-screen grid place-items-center">Event not found</div>;

  const counts = {
    yes: rsvps.filter((r) => r.status === "yes").length,
    maybe: rsvps.filter((r) => r.status === "maybe").length,
    no: rsvps.filter((r) => r.status === "no").length,
  };

  const pieData = [
    { name: "Yes", value: counts.yes },
    { name: "Maybe", value: counts.maybe },
    { name: "No", value: counts.no },
  ];

  const totalGuests = rsvps.reduce(
    (sum, r) => sum + (r.guest_count || 1),
    0
  );

  const baseUrl =
    process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;

  const rsvpLink = `${baseUrl}/rsvp/${event.slug || event.id}`;

  const shareWhatsApp = () => {
    const msg = `You're invited to *${event.name}* 🎉\n\n📅 ${dayjs(
      event.date
    ).format("ddd, MMM D, YYYY h:mm A")}\n📍 ${
      event.venue || ""
    }\n\nRSVP here:\n${rsvpLink}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(rsvpLink);
    alert("Link copied!");
  };

  const deleteEvent = async () => {
    const confirmDelete = window.confirm("Delete this event?");
    if (!confirmDelete) return;

    await supabase.from("events").delete().eq("id", event.id);
    navigate("/");
  };

  const exportCSV = () => {
    const header = ["name", "status", "guest_count", "note"];
    const rows = rsvps.map((r) => [
      r.name || "",
      r.status || "",
      r.guest_count || 1,
      (r.note || "").replace(/\n/g, " "),
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name}-guests.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-700">
              {event.name}
            </h2>
            <p>{dayjs(event.date).format("ddd, MMM D, YYYY h:mm A")}</p>
            <p>📍 {event.venue}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate("/")} className="btn">Back</button>
            <button onClick={shareWhatsApp} className="btn bg-green-500 text-white">WhatsApp</button>
            <button onClick={copyLink} className="btn">Copy Link</button>
            <button onClick={() => navigate(`/edit/${event.id}`)} className="btn">Edit</button>
            <button onClick={deleteEvent} className="btn bg-red-500 text-white">Delete</button>
            <button onClick={exportCSV} className="btn">Export CSV</button>
            <button onClick={() => setShowQR(!showQR)} className="btn">
              {showQR ? "Hide QR" : "Show QR"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-3 border-b pb-2">
          {["guests", "feedback", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CONTENT */}

        {/* 👥 GUESTS */}
        {activeTab === "guests" && (
          <div className="space-y-4">
            {rsvps.map((g) => (
              <motion.div
                key={g.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between"
              >
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-sm text-gray-600">
                    {g.status} • Guests: {g.guest_count || 1}
                  </p>
                </div>

                {showQR && (
                  <QRCodeCanvas
                    value={`${rsvpLink}?guest=${g.id}`}
                    size={60}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 💌 FEEDBACK */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            {rsvps.filter((g) => g.note).map((g) => (
              <div className="bg-white p-4 rounded-xl shadow">
                <p className="font-semibold text-purple-600">{g.name}</p>
                <p className="italic mt-2">“{g.note}”</p>
              </div>
            ))}
          </div>
        )}

        {/* 📊 ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 text-sm space-y-1">
              <div>✅ Yes: {counts.yes}</div>
              <div>🤔 Maybe: {counts.maybe}</div>
              <div>❌ No: {counts.no}</div>
              <div className="font-semibold">👥 Total: {totalGuests}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}