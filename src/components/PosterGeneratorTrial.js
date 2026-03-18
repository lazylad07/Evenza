import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const PosterGeneratorTrial = () => {
  const [eventName, setEventName] = useState("");
  const [theme, setTheme] = useState("classic");
  const [tagline, setTagline] = useState("");
  const posterRef = useRef(null);

  const themes = {
    classic: {
      bg: "bg-gradient-to-br from-yellow-100 via-white to-orange-100",
      accent: "text-orange-600",
      border: "border-orange-400",
    },
    elegant: {
      bg: "bg-gradient-to-br from-gray-900 via-gray-700 to-black text-white",
      accent: "text-pink-400",
      border: "border-gray-500",
    },
    beach: {
      bg: "bg-gradient-to-br from-sky-200 via-blue-100 to-yellow-100",
      accent: "text-blue-700",
      border: "border-blue-300",
    },
  };

  const downloadPoster = async () => {
    const poster = posterRef.current;
    if (!poster) return;

    const canvas = await html2canvas(poster, { useCORS: true, scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${eventName || "poster"}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">
        🎨 AI-Style Poster Generator (Free)
      </h1>

      {/* Inputs */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8">
        <input
          type="text"
          placeholder="Event Name (e.g. Mom’s Kitty Party)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full border p-2 mb-4 rounded-lg"
        />

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full border p-2 mb-4 rounded-lg"
        >
          <option value="classic">🌼 Classic</option>
          <option value="elegant">🌙 Elegant</option>
          <option value="beach">🏖️ Beach</option>
        </select>

        <input
          type="text"
          placeholder="Tagline (e.g. Glam & Glitter Night!)"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full border p-2 mb-4 rounded-lg"
        />

        <button
          onClick={downloadPoster}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
        >
          Download Poster
        </button>
      </div>

      {/* Poster Preview */}
      <div
        ref={posterRef}
        className={`relative w-[340px] h-[480px] rounded-2xl shadow-xl border-4 p-6 text-center flex flex-col justify-center ${themes[theme].bg} ${themes[theme].border}`}
      >
        <h2
          className={`text-2xl font-extrabold mb-2 ${themes[theme].accent} tracking-wide`}
        >
          {eventName || "Your Event Name"}
        </h2>
        <p className="text-lg italic opacity-80 mb-4">
          {tagline || "Your tagline goes here!"}
        </p>
        <div className="absolute bottom-4 left-0 w-full text-sm opacity-60">
          <p>✨ Designed with Evenza Poster Studio ✨</p>
        </div>
      </div>
    </div>
  );
};

export default PosterGeneratorTrial;
