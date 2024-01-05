const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
    eventName: String,
    date: {
      type: Date,
    },
    chain: String,
    address1: String,
    address2: String,
    startTime: String,
    endTime: String,
    eventCatagory: String,
    description: String,
    royalityPercentage: String,

    ticket: Array,
    complimentaryTicket: String,
    eventImages: String,
    eventCoverImages: String,
   
    galleryImage: Array,
    approvedbyadmin:{
      type:Boolean,
      default: false,
    },
    pending:{
      type:Boolean,
      default: false,
    },
    payed:{
      type:Boolean,
      default: false,
    },
    live:{
      type:Boolean,
      default: false,
    },
    attendee: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default:"" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("event", authSchema);
