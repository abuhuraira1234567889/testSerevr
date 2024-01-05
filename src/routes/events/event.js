const Controller = require("../../controllers/events/event");
const authenticationToken = require("../../middleware/authenticateToken");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

module.exports = (app) => {
  app.route("/api/create-event").post(
    authenticationToken,
    Controller.createEvent
  );
  // app.route("/api/create-event").post(
  //   authenticationToken,
  //   upload.fields([
  //     { name: "eventImages", maxCount: 1 },
  //     { name: "eventCoverImages", maxCount: 1 },
  //     { name: "galleryImage", maxCount: 10 },
  //   ]),
  //   Controller.createEvent
  // );
  app
    .route("/api/approved-by-admin/:id")
    .post(authenticationToken, Controller.approveByAdmin);
    app
    .route("/api/decline-by-admin/:id")
    .post(authenticationToken, Controller.declineByAdmin);
    app
    .route("/api/payed-event/:id/:address")
    .post(authenticationToken, Controller.payed);
    app
    .route("/api/getAllEvent")
    .get(Controller.getAllEvent);
    app
    .route("/api/getDashboardEvent")
    .get(Controller.getDashboardEvent);
    app
    .route("/api/live-event-user/:id")
    .get(authenticationToken, Controller.getLiveEventUser);
    app
    .route("/api/getAppEventOfUser/:id")
    .get(authenticationToken,Controller.getAllEventOfUser);
    app
    .route("/api/getAdminEvents")
    .get(authenticationToken,Controller.getAllEventAdmin);
    app
    .route("/api/getPendingEventAdmin")
    .get(authenticationToken,Controller.getAllPendingEvent);
    app
    .route("/api/getEventById/:id")
    .get(Controller.getEventById);
    app
    .route("/api/getAllLiveEventAdmin")
    .get(authenticationToken,Controller.getAllLiveEventAdmin);
    app
    .route("/api/getPastEventAdmin")
    .get(authenticationToken,Controller.getpastEventAdmin);
    app
    .route("/api/getApprovedByAdmin")
    .get(authenticationToken,Controller.getApprovedByAdmin);

    app
    .route("/api/getAllEventOfUsers/:id")
    .get(authenticationToken,Controller.getAllEventOfUsers);
    app
    .route("/api/getUserPending/:id")
    .get(authenticationToken,Controller.getNotApproved);
    app
    .route("/api/getUserApproved/:id")
    .get(authenticationToken,Controller.getApproved);
    app
    .route("/api/getUserPastEvents/:id")
    .get(authenticationToken,Controller.getpastEventUsers);
    
};
