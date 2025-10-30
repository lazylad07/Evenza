// src/utils/share.js
export function generateWhatsAppLinkForEvent(eventId, eventName, eventDateStr) {
  const base = "https://evenza-77a26.web.app/event/";
  const url = `${base}${eventId}`;
  const message = `You're invited to "${eventName}" on ${eventDateStr}! RSVP here: ${url}`;
  // wa.me prefer encoded text param
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
