import React from "react";
import { cn } from "../../utils";

export default function EventCard({ event }) {
  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:shadow-xl transition-all"
    )}>
      <h3 className="text-xl font-semibold">{event.title}</h3>
      <p className="text-neutral-600">{event.description}</p>
      <p className="text-sm text-neutral-500">{event.date}</p>
    </div>
  );
}
