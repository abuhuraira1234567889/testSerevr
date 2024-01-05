const mongoose = require("mongoose");

const attendEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "event",
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "event",
      },

    
  },
  { timestamps: true }
);

module.exports = mongoose.model("attendEvent", attendEventSchema);
