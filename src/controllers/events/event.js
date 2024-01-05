const Event = require("../../modals/event");
const mongoose = require("mongoose");
module.exports = {
  createEvent: async (req, res) => {
    try {
      const {
        creatorId,
        eventName,
        chain,
        address1,
        address2,
        date,
        startTime,
        endTime,
        eventCatagory,
        description,
        royalityPercentage,
        ticket,
        complimentaryTicket,
        eventImages,
        eventCoverImages,
        galleryImages
      } = req.body;
      console.log("comming in this",req.body)
      // const eventImages = req.files.eventImages
      //   ? req.files.eventImages[0].filename
      //   : "";
      // const eventCoverImages = req.files.eventCoverImages
      //   ? req.files.eventCoverImages[0].filename
      //   : "";
      // const galleryImages = req.files.galleryImage
      //   ? req.files.galleryImage.map((image) => image.filename)
      //   : [];
      // console.log(galleryImages, req.files.galleryImage);
      const newEvent = new Event({
        creatorId,
        eventName,
        chain,
        address1,
        address2,
        date,
        startTime,
        endTime,
        eventCatagory,
        description,
        royalityPercentage,
        ticket,
        complimentaryTicket,
        eventImages ,
        eventCoverImages,
        galleryImage:galleryImages
      });
      const savedEvent = await newEvent.save();
      res.status(200).json(savedEvent);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  },
  approveByAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findOne({ _id: id });
      if (!event) {
        return res.status(400).json({ error: "Event not found" });
      }
      event.approvedbyadmin = true;
      event.pending = true;
      await event.save();
      res.status(200).json({ message: "Event approved successfully" });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  },
  declineByAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findOneAndDelete({ _id: id });
      if (!event) {
        return res.status(400).json({ error: "Event not found" });
      }

      res
        .status(200)
        .json({ message: "Event delted successfully successfully" });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  },
  payed: async (req, res) => {
    try {
      const { id,address } = req.params;
    
      const event = await Event.findOne({ _id: id });
      if (!event) {
        return res.status(400).json({ error: "Event not found" });
      }
      event.pending = false;
      event.payed = true;
      event.live = true;
      event.address=address;
      await event.save();
      res.status(200).json({ message: "Event payed successfully" });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  },
  getAllEvent: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ live: true });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id", // Match by event ID
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getDashboardEvent: async (req, res) => {
    try {
      const currentDate = new Date();
      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
            date: { $gt: currentDate },
          },
        },
        {
          $lookup: {
            from: "auths", // name of the collection in the database (not the model name)
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id", // Match by event ID
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      return res.status(200).json(liveEvents);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  },
  getLiveEventUser: async (req, res) => {
    try {
      const { id } = req.params;
      const page = req.query.page || 1; // Current page number, default is 1
      const pageSize = 4; // Fixed page size

      const skip = (page - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
            creatorId: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id", // Match by event ID
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      return res.status(200).json(liveEvents);
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getAllEventOfUser: async (req, res) => {
    try {
      const { id } = req.params;
      const page = req.query.page || 1; // Current page number, default is 1
      const pageSize = 4; // Fixed page size

      const skip = (page - 1) * pageSize;

      const userEvents = await Event.aggregate([
        {
          $match: {
            creatorId: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json(userEvents);
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getAllEventAdmin: async (req, res) => {
    try {
      const page = req.query.page || 1; // Current page number, default is 1
      const pageSize = 2; // Fixed page size

      const skip = (page - 1) * pageSize;

      const count = await Event.countDocuments({});
      const totalPages = Math.ceil(count / pageSize);
      const lastPageSize =
        page === totalPages ? count % pageSize || pageSize : pageSize;

      const liveEvents = await Event.aggregate([
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage: parseInt(page, 10),
        totalRecords: count,
        rows: liveEvents?.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getAllPendingEvent: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ approvedbyadmin: false });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            approvedbyadmin: false,
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getAllLiveEventAdmin: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ live: true });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id", // Match by event ID
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getEventById: async (req, res) => {
    try {
      const eventId = req.params.id;

      const event = await Event.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(eventId),
            live: true,
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id",
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      if (!event || event.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }

      return res.status(200).json({
        event,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getpastEventAdmin: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1
      const currentDate = new Date(); // Get the current date

      const count = await Event.countDocuments({
        live: true,
        date: { $lt: currentDate },
      });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
            date: { $lt: currentDate }, // Filter past events
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getApprovedByAdmin: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1
      const currentDate = new Date(); // Get the current date

      const count = await Event.countDocuments({
        approvedbyadmin: true,
        live: false,
      });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: false,
            approvedbyadmin: true, // Filter past events
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getAllEventOfUsers: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ creatorId: req.params.id });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            creatorId: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $lookup: {
            from: "buytickets",
            localField: "_id", // Match by event ID
            foreignField: "eventId",
            as: "tickets",
          },
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getNotApproved: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ approvedbyadmin: false,creatorId: req.params.id });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            creatorId: new mongoose.Types.ObjectId(req.params.id),
            approvedbyadmin: false,
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getApproved: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1

      const count = await Event.countDocuments({ approvedbyadmin: true,creatorId: req.params.id });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            creatorId: new mongoose.Types.ObjectId(req.params.id),
            approvedbyadmin: true,
            live:false
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
  getpastEventUsers: async (req, res) => {
    try {
      const pageSize = 2; // Fixed page size
      const currentPage = parseInt(req.query.page, 10) || 1; // Current page number, default is 1
      const currentDate = new Date(); // Get the current date

      const count = await Event.countDocuments({
        live: true,
        date: { $lt: currentDate },
        creatorId: req.params.id 
      });
      const totalPages = Math.ceil(count / pageSize);

      const skip = (currentPage - 1) * pageSize;

      const liveEvents = await Event.aggregate([
        {
          $match: {
            live: true,
            date: { $lt: currentDate }, // Filter past events
            creatorId: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "auths",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({
        liveEvents,
        totalPages,
        currentPage,
        totalRecords: count,
        rows: liveEvents.length,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "An error occurred" });
    }
  },
};
