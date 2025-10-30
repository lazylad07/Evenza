{/* Guest Modal */}
{showGuestModal && selectedEvent && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed inset-0 bg-black/30 flex justify-center items-center"
  >
    <div className="bg-white p-6 rounded-2xl shadow-lg w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        Guests for "{selectedEvent.name}"
      </h2>

      {/* Guest Stats + Share */}
      <div className="flex justify-between items-center mb-4">
        <div>Total Guests: {totalGuests}</div>
        <div>Confirmed: {confirmed}</div>
        <div>Maybe: {maybe}</div>
        <button
          onClick={() => handleShareWhatsApp(selectedEvent.id)}
          className="flex items-center gap-1 bg-whatsapp-green text-white px-3 py-1 rounded-xl ml-2"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Add Guest */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Guest Name"
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
          className="flex-1 p-2 border rounded-xl"
        />
        <button
          onClick={handleAddGuest}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Add Guest
        </button>
      </div>

      {/* Guest List */}
      <div className="space-y-2">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex justify-between items-center p-2 border rounded-xl"
          >
            <span>{guest.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleUpdateRSVP(guest.id, "Yes")}
                className={`px-2 py-1 rounded-xl ${
                  guest.rsvp === "Yes"
                    ? "bg-green-500 text-white"
                    : "border"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleUpdateRSVP(guest.id, "Maybe")}
                className={`px-2 py-1 rounded-xl ${
                  guest.rsvp === "Maybe"
                    ? "bg-yellow-400 text-white"
                    : "border"
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => handleUpdateRSVP(guest.id, "No")}
                className={`px-2 py-1 rounded-xl ${
                  guest.rsvp === "No"
                    ? "bg-red-500 text-white"
                    : "border"
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => setShowGuestModal(false)}
          className="px-4 py-2 rounded-xl border"
        >
          Close
        </button>
      </div>
    </div>
  </motion.div>
)}
