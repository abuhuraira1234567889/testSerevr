const Event = require("../../modals/event");
const BuyTicket = require("../../modals/buyTocket");
const AttendEvent = require("../../modals/attendEvent");
const qr = require("qrcode");

const mongoose = require("mongoose");
module.exports = {
  buyTickets: async (req, res) => {
    try {
      const { userId, eventId } = req.params;
      const { ticketType, ticketQuantity } = req.body;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(400).json({ error: "Event not found" });
      }

      const ticketIndex = event.ticket.findIndex(
        (ticket) => ticket.type === ticketType
      );
      if (
        ticketIndex === -1 ||
        parseInt(event.ticket[ticketIndex].number) < parseInt(ticketQuantity)
      ) {
        return res.status(400).json({ error: "Not enough tickets available" });
      }

      // Update the document directly
      await Event.findByIdAndUpdate(
        eventId,
        {
          $set: {
            [`ticket.${ticketIndex}.number`]: (
              parseInt(event.ticket[ticketIndex].number) -
              parseInt(ticketQuantity)
            ).toString(),
          },
        },
        { new: true }
      );

      // Create and save tickets to the database based on quantity
      for (let i = 0; i < parseInt(ticketQuantity); i++) {
        const newTicket = new BuyTicket({
          buyerId: userId,
          eventId,
          ticketType,
          ticketQuantity: "1", // You can modify this if you want to store 1 for each ticket
        });

        // Save the ticket to the database
        await newTicket.save();
      }

      res.status(200).json({ message: "Tickets purchased successfully!" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getUserTickets: async (req, res) => {
    try {
      const page = req.query.page || 1; // Current page number, default is 1
      const pageSize = 2; // Fixed page size

      const skip = (page - 1) * pageSize;

      const tickets = await BuyTicket.find({ buyerId: req.params.id })
        .populate("eventId") // Populate all fields of the eventId
        .populate("buyerId")
        .skip(skip)
        .limit(pageSize)
        .exec();

      res.status(200).json(tickets);
    } catch (err) {
      res.status(400).json({ error: err.message || "An error occurred" });
    }
  },
  generateCode: async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const ticketId = req.params.ticketId;

      const dataToEncode = `https://piqsolvent/${eventId}/${ticketId}`;

      const qrCodeBase64 = await qr.toDataURL(dataToEncode);
      res.json({ qrCode: qrCodeBase64 });
    } catch (err) {
      res.status(400).json({ error: err.message || "An error occurred" });
    }
  },
  addAttendence: async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const ticketId = req.params.ticketId;
      const code = req.body.code;

      if (code === 12345) {
        const Events = await Event.findOne({ _id: eventId });
        if (Events) {
          const attendEvent = await AttendEvent.findOne({ ticketId: ticketId });
          if (attendEvent) {
            return res.status(400).json({ error: "Already Entered" });
          } else {
            Events.attendee += 1;
            await Events.save();
            const datas = new AttendEvent({
              eventId: eventId,
              ticketId: ticketId,
            });
            await datas.save();
            return res.json({ message: "Attendance added successfully" });
          }
        } else {
          return res.status(400).json({ error: "Events not found" });
        }
      } else {
        return res.status(400).json({ error: "hmmm hacking" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message || "An error occurred" });
    }
  },
};
