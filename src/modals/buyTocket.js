const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "event",
    },

    ticketType: String,
    ticketQuantity: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("buyTicket", ticketSchema);
