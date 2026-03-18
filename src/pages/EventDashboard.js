// src/pages/EventDashboard.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { QRCodeCanvas } from "qrcode.react";
import { AddToCalendarButton } from "add-to-calendar-button-react";

const THEME_OPTIONS = [
  { key: "", label: "Default", color: "bg-gray-100 text-gray-800" },
  { key: "wedding", label: "Wedding", color: "bg-pink-100 text-pink-700" },
  { key: "birthday", label: "Birthday", color: "bg-yellow-100 text-yellow-800" },
  { key: "corporate", label: "Corporate", color: "bg-blue-100 text-blue-700" },
  { key: "party", label: "Party", color: "bg-purple-100 text-purple-700" },
];

const EVENT_TYPES = ["Wedding", "Birthday", "Engagement", "Corporate", "Baby Shower", "College Fest", "Society Event", "Garba Night"];

const MODULE_OPTIONS = [
  { key: "guest_management", label: "Guest Management" },
  { key: "feedback", label: "Feedback" },
  { key: "schedule", label: "Schedule" },
  { key: "gallery", label: "Gallery" },
  { key: "games", label: "Games" },
  { key: "music_playlist", label: "Music Playlist" },
  { key: "food_menu", label: "Food Menu" },
];

const THEME_MODULES = {
  wedding: ["guest_management", "schedule", "gallery", "feedback"],
  birthday: ["guest_management", "games", "music_playlist", "food_menu"],
  corporate: ["guest_management", "schedule", "feedback", "food_menu"],
  party: ["guest_management", "music_playlist", "games", "food_menu"],
  "": ["guest_management", "feedback"],
};

export default function EventDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDressCode, setEventDressCode] = useState("");
  const [eventTheme, setEventTheme] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch events
  useEffect(() => {
    if (!user?.id) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          rsvps(id, status, guest_count),
          event_modules(module_key)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) return console.error("Fetch error:", error);

      const mapped = (data || []).map(ev => {
        const rsvps = ev.rsvps || [];
        const yes = rsvps.filter(r => String(r.status).toLowerCase() === "yes").length;
        const maybe = rsvps.filter(r => String(r.status).toLowerCase() === "maybe").length;
        const no = rsvps.filter(r => String(r.status).toLowerCase() === "no").length;
        const totalGuests = rsvps.reduce((s, r) => s + (Number(r.guest_count) || 1), 0);
        return { ...ev, _counts: { yes, maybe, no, totalGuests }, _modules: ev.event_modules?.map(m => m.module_key) || [] };
      });

      setEvents(mapped);
    };

    fetchEvents();

    const eChan = supabase
      .channel("events-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchEvents)
      .subscribe();
    const rChan = supabase
      .channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(eChan);
      supabase.removeChannel(rChan);
    };
  }, [user?.id]);

  // Handle module checkbox toggle
  const toggleModule = (key) => {
    setSelectedModules(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  };

  const handleCreateEvent = async () => {
    if (!eventName || !eventDate) return alert("Event name & date required");
    const slug = eventName.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

    const payload = {
      name: eventName,
      date: new Date(eventDate).toISOString(),
      venue: eventVenue || null,
      dress_code: eventDressCode || null,
      theme: eventTheme || null,
      event_type: eventType || null,
      slug,
      user_id: user.id,
    };

    const { data: evData, error } = await supabase.from("events").insert([payload]).select().single();
    if (error) return alert("Failed to create: " + error.message);

    // Insert selected modules
    const modulesToInsert = selectedModules.length > 0 ? selectedModules : THEME_MODULES[eventTheme] || ["guest_management"];
    await supabase.from("event_modules").insert(modulesToInsert.map(m => ({ event_id: evData.id, module_key: m })));

    // Reset
    setEventName(""); setEventDate(""); setEventVenue(""); setEventDressCode(""); setEventTheme(""); setEventType(""); setSelectedModules([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
  };

  const handleEditSave = async () => {
    if (!editingEvent?.name || !editingEvent?.date) return alert("Fill fields");

    const { error } = await supabase
      .from("events")
      .update({
        name: editingEvent.name,
        date: new Date(editingEvent.date).toISOString(),
        venue: editingEvent.venue || null,
        dress_code: editingEvent.dress_code || null,
        theme: editingEvent.theme || null,
        event_type: editingEvent.event_type || null
      })
      .eq("id", editingEvent.id);

    if (error) return alert("Update failed: " + error.message);

    // Update modules dynamically
    await supabase.from("event_modules").delete().eq("event_id", editingEvent.id);
    const modulesToInsert = editingEvent._modules.length > 0 ? editingEvent._modules : THEME_MODULES[editingEvent.theme] || ["guest_management"];
    await supabase.from("event_modules").insert(modulesToInsert.map(m => ({ event_id: editingEvent.id, module_key: m })));

    setEditingEvent(null);
  };


    return name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "") // remove special chars
      .replace(/\s+/g, "-");      // replace spaces with -
  };

  const shareWhatsApp = (ev) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;
  const link = `${baseUrl}/rsvp/${ev.slug || ev.id}`;

  const textLines = [
    `You're invited to: ${ev.name}`,
    `Date: ${dayjs(ev.date).format("ddd, MMM D, YYYY h:mm A")}`,
    ev.venue ? `Venue: ${ev.venue}` : '',
    ev.dress_code ? `Dress Code: ${ev.dress_code}` : '',
    '',
    `RSVP here: ${link}`
  ];

  const text = textLines.filter(Boolean).join('\n');

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};
  async function copyLink(ev) {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/rsvp/${ev.slug || ev.id}`;
    try { await navigator.clipboard.writeText(link); alert("Link copied!"); } catch { alert("Copy failed"); }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar logout={logout} email={user?.email} />

      <div className="max-w-7xl mx-auto p-6">
        {/* CREATE EVENT */}
        <motion.div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Create a New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input className="p-3 border rounded-lg" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} />
            <input type="datetime-local" className="p-3 border rounded-lg" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            <input className="p-3 border rounded-lg" placeholder="Venue" value={eventVenue} onChange={e => setEventVenue(e.target.value)} />
            <input className="p-3 border rounded-lg" placeholder="Dress Code" value={eventDressCode} onChange={e => setEventDressCode(e.target.value)} />
            <select className="p-3 border rounded-lg" value={eventTheme} onChange={e => {
              setEventTheme(e.target.value);
              // auto-select theme modules dynamically
              setSelectedModules(THEME_MODULES[e.target.value] || []);
            }}>
              {THEME_OPTIONS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <select className="p-3 border rounded-lg" value={eventType} onChange={e => setEventType(e.target.value)}>
              <option value="">Event Type</option>
              {EVENT_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
            </select>

            {/* Modules checkboxes */}
            <div className="md:col-span-6 flex flex-wrap gap-2">
              {MODULE_OPTIONS.map(m => (
                <label key={m.key} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:scale-105 transition-transform">
                  <input type="checkbox" checked={selectedModules.includes(m.key)} onChange={() => toggleModule(m.key)} />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>

            <button className="md:col-span-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:scale-105 transition-transform" onClick={handleCreateEvent}>Create Event</button>
          </div>
        </motion.div>

        {/* EVENTS GRID */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => {
            const theme = THEME_OPTIONS.find(t => t.key === ev.theme) || THEME_OPTIONS[0];
            return (
              <motion.div key={ev.id} layout className={`p-5 rounded-2xl shadow-xl flex flex-col hover:scale-105 transition-transform ${theme.color}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{ev.name}</h3>
                </div>
                <p className="text-sm">{dayjs(ev.date).format("ddd, MMM D, YYYY h:mm A")}</p>
                {ev.venue && <p className="text-sm">📍 {ev.venue}</p>}
                {ev.dress_code && <p className="text-sm">👗 {ev.dress_code}</p>}
                {ev.theme && <p className="text-sm">🎨 {ev.theme}</p>}
                {ev.event_type && <p className="text-sm font-semibold">🗂 {ev.event_type}</p>}

                <div className="mt-2 flex flex-wrap gap-2">
                  {ev._modules.map(m => (
                    <span key={m} className="bg-white/60 text-gray-800 px-2 py-1 rounded-full text-xs">{m.replace("_", " ")}</span>
                  ))}
                </div>

                {/* RSVP summary */}
                <div className="mt-3 flex gap-2 text-sm font-medium">
                  <span className="text-green-600">✅ {ev._counts?.yes || 0}</span>
                  <span className="text-yellow-600">🤔 {ev._counts?.maybe || 0}</span>
                  <span className="text-red-600">❌ {ev._counts?.no || 0}</span>
                  <span className="text-gray-600">👥 {ev._counts?.totalGuests || 0}</span>
                </div>

               <div className="mt-4 flex gap-2 flex-wrap items-center">

  <button onClick={() => shareWhatsApp(ev)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm">
    WhatsApp
  </button>

  <button onClick={() => copyLink(ev)} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
    Copy Link
  </button>

  {/* ✅ ADD HERE */}
  <button
    onClick={() => navigate(`/view-guests/${ev.id}`)}
    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
  >
    View Guests
  </button>

  <QRCodeCanvas value={`${window.location.origin}/rsvp/${ev.slug || ev.id}`} size={90} />

  <AddToCalendarButton
    name={ev.name}
    startDate={dayjs(ev.date).format("YYYY-MM-DD")}
    startTime={dayjs(ev.date).format("HH:mm")}
    timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
    options={["Google", "Apple", "Outlook.com"]}
    location={ev.venue || ""}
    label="Add to Calendar"
  />

  <button onClick={() => setEditingEvent(ev)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
    Edit
  </button>

  <button onClick={() => handleDelete(ev.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm">
    Delete
  </button>
</div>
</motion.div>
            );
          })}
        </div>

        {/* ✅ EDIT MODAL (OUTSIDE MAP) */}
{editingEvent && (
  <motion.div
    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
      <h3 className="text-xl font-bold mb-3">Edit Event</h3>

      <input
        className="w-full p-3 border rounded-lg mb-2"
        value={editingEvent.name}
        onChange={(e) =>
          setEditingEvent({ ...editingEvent, name: e.target.value })
        }
      />

      <input
        type="datetime-local"
        className="w-full p-3 border rounded-lg mb-2"
        value={dayjs(editingEvent.date).format("YYYY-MM-DDTHH:mm")}
        onChange={(e) =>
          setEditingEvent({ ...editingEvent, date: e.target.value })
        }
      />

      <input
        className="w-full p-3 border rounded-lg mb-2"
        placeholder="Venue"
        value={editingEvent.venue || ""}
        onChange={(e) =>
          setEditingEvent({ ...editingEvent, venue: e.target.value })
        }
      />

      <input
        className="w-full p-3 border rounded-lg mb-2"
        placeholder="Dress Code"
        value={editingEvent.dress_code || ""}
        onChange={(e) =>
          setEditingEvent({ ...editingEvent, dress_code: e.target.value })
        }
      />

      <select
        className="w-full p-3 border rounded-lg mb-2"
        value={editingEvent.theme || ""}
        onChange={(e) => {
          const themeVal = e.target.value;
          setEditingEvent({
            ...editingEvent,
            theme: themeVal,
            _modules: THEME_MODULES[themeVal] || [],
          });
        }}
      >
        {THEME_OPTIONS.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        className="w-full p-3 border rounded-lg mb-2"
        value={editingEvent.event_type || ""}
        onChange={(e) =>
          setEditingEvent({
            ...editingEvent,
            event_type: e.target.value,
          })
        }
      >
        <option value="">Event Type</option>
        {EVENT_TYPES.map((et) => (
          <option key={et} value={et}>
            {et}
          </option>
        ))}
      </select>

      {/* Modules */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MODULE_OPTIONS.map((m) => (
          <label
            key={m.key}
            className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={editingEvent._modules?.includes(m.key)}
              onChange={() => {
                const updated = editingEvent._modules?.includes(m.key)
                  ? editingEvent._modules.filter((x) => x !== m.key)
                  : [...(editingEvent._modules || []), m.key];

                setEditingEvent({
                  ...editingEvent,
                  _modules: updated,
                });
              }}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingEvent(null)}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleEditSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </motion.div>
)}
      </div>
    </div>
  );

