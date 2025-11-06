import React, { useRef } from "react";
import html2canvas from "html2canvas";

const PosterGenerator = ({ eventName, date, tagline }) => {
  const posterRef = useRef();

  const downloadPoster = async () => {
    const canvas = await html2canvas(posterRef.current);
    const link = document.createElement("a");
    link.download = `${eventName}-poster.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen">
      <div
        ref={posterRef}
        className="relative bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500 text-white rounded-3xl shadow-xl w-80 h-96 flex flex-col items-center justify-center text-center p-6"
      >
        <h1 className="text-4xl font-bold">{eventName}</h1>
        <p className="mt-2 text-lg">{tagline}</p>
        <p className="absolute bottom-6 text-sm">{date}</p>
      </div>

      <button
        onClick={downloadPoster}
        className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md"
      >
        Download Poster 🖼️
      </button>
    </div>
  );
};

export default PosterGenerator;
